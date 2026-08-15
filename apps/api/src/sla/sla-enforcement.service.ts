import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from './sla.service';
import * as dayjs from 'dayjs';

@Injectable()
export class SlaEnforcementService {
  private readonly logger = new Logger(SlaEnforcementService.name);
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000;

  private readonly defaultBusinessHours = {
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: 9,
    workingHoursEnd: 18,
    timezone: 'Asia/Jakarta',
    holidayExceptions: [] as string[],
  };

  constructor(
    private prisma: PrismaService,
    private slaService: SlaService,
  ) {}

  onModuleInit() {
    this.logger.log('SLA Enforcement Service started');
    this.startEnforcement();
  }

  startEnforcement() {
    this.intervalId = setInterval(async () => {
      try {
        await this.checkSlaBreaches();
      } catch (error) {
        this.logger.error('SLA enforcement check failed', error);
      }
    }, this.CHECK_INTERVAL);
  }

  stopEnforcement() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkSlaBreaches() {
    const incidents = await this.prisma.incident.findMany({
      where: { status: { in: ['open', 'investigating'] }, deletedAt: null },
      include: { assignee: true },
    });

    for (const incident of incidents) {
      if (!incident.severity) continue;

      const elapsedMinutes = await this.getElapsedBusinessMinutes(incident.createdAt);
      const slaName = incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1);
      const slaCheck = await this.slaService.checkBreach(slaName, elapsedMinutes);

      if (slaCheck.breached && incident.status !== 'escalated') {
        await this.escalateIncident(incident.id, incident.assigneeId);
        this.notifyEscalation(incident.title, elapsedMinutes, 'breached');
      } else if (slaCheck.warning && incident.status !== 'escalated') {
        this.notifyWarning(incident.title, elapsedMinutes);
      }
    }

    const requests = await this.prisma.request.findMany({
      where: { status: { in: ['submitted', 'approval', 'in_progress'] }, deletedAt: null },
      include: { approvals: true },
    });

    for (const request of requests) {
      if (!request.priority) continue;

      const elapsedMinutes = await this.getElapsedBusinessMinutes(request.createdAt);
      const slaName = request.priority.charAt(0).toUpperCase() + request.priority.slice(1);
      const slaCheck = await this.slaService.checkBreach(slaName, elapsedMinutes);

      if (slaCheck.breached) {
        this.notifyEscalation(`Request: ${request.title}`, elapsedMinutes, 'breached');
      } else if (slaCheck.warning) {
        this.notifyWarning(request.title, elapsedMinutes);
      }
    }
  }

  async getElapsedBusinessMinutes(startTime: Date): Promise<number> {
    let current = dayjs(startTime);
    const now = dayjs();
    let elapsedMinutes = 0;

    while (current.isBefore(now)) {
      const dayOfWeek = current.day();

      if (!this.defaultBusinessHours.workingDays.includes(dayOfWeek)) {
        current = current.add(1, 'day').startOf('day');
        continue;
      }

      if (current.hour() < this.defaultBusinessHours.workingHoursStart) {
        current = current.hour(this.defaultBusinessHours.workingHoursStart).minute(0).second(0);
      } else if (current.hour() >= this.defaultBusinessHours.workingHoursEnd) {
        current = current.add(1, 'day').startOf('day');
        continue;
      }

      if (this.defaultBusinessHours.holidayExceptions.includes(current.format('YYYY-MM-DD'))) {
        current = current.add(1, 'day').startOf('day');
        continue;
      }

      const endOfDay = current.hour(this.defaultBusinessHours.workingHoursEnd).minute(0).second(0);
      const nextSlot = now.isBefore(endOfDay) ? now : endOfDay;
      elapsedMinutes += nextSlot.diff(current, 'minute');
      current = nextSlot;
    }

    return elapsedMinutes;
  }

  private async escalateIncident(incidentId: string, assigneeId?: string | null) {
    await this.prisma.incident.update({
      where: { id: incidentId },
      data: { status: 'escalated' },
    });

    if (assigneeId) {
      await this.prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Incident Escalated',
          message: 'Incident has been escalated due to SLA breach.',
          type: 'incident_escalation',
        },
      });
    }
  }

  private notifyWarning(title: string, elapsedMinutes: number) {
    this.logger.warn(`SLA Warning: ${title} - ${elapsedMinutes} min elapsed`);
  }

  private notifyEscalation(title: string, elapsedMinutes: number, reason: string) {
    this.logger.warn(`SLA Escalation: ${title} - ${elapsedMinutes} min elapsed (${reason})`);
  }

  onModuleDestroy() {
    this.stopEnforcement();
  }
}