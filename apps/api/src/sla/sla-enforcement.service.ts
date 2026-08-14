import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlaService } from '../sla/sla.service';
import dayjs from 'dayjs';

@Injectable()
export class SlaEnforcementService implements OnModuleInit {
  private readonly logger = new Logger(SlaEnforcementService.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private slaService: SlaService,
  ) {}

  onModuleInit() {
    this.startEnforcement();
  }

  startEnforcement() {
    this.intervalId = setInterval(async () => {
      try {
        await this.checkSlaBreaches();
      } catch (error) {
        this.logger.error('SLA enforcement check failed', error);
      }
    }, 60000);
  }

  async checkSlaBreaches() {
    const incidents = await this.prisma.incident.findMany({
      where: {
        status: { in: ['open', 'investigating', 'escalated'] },
        deletedAt: null,
      },
      include: { assignee: true },
    });

    for (const incident of incidents) {
      if (!incident.severity) continue;

      const elapsedMinutes = dayjs().diff(dayjs(incident.createdAt), 'minute');
      const slaName = incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1);
      const slaCheck = await this.slaService.checkBreach(slaName, elapsedMinutes);

      if (slaCheck.warning || slaCheck.breached) {
        await this.handleSlaAlert(incident, slaCheck, elapsedMinutes);
      }
    }

    const requests = await this.prisma.request.findMany({
      where: { status: { in: ['submitted', 'approval', 'in_progress'] }, deletedAt: null },
      include: { approvals: true },
    });

    for (const request of requests) {
      if (!request.priority) continue;

      const elapsedMinutes = dayjs().diff(dayjs(request.createdAt), 'minute');
      const slaName = request.priority.charAt(0).toUpperCase() + request.priority.slice(1);
      const slaCheck = await this.slaService.checkBreach(slaName, elapsedMinutes);

      if (slaCheck.warning || slaCheck.breached) {
        await this.handleRequestSlaAlert(request, slaCheck, elapsedMinutes);
      }
    }
  }

  private async handleSlaAlert(incident: any, slaCheck: { warning: boolean; breached: boolean }, elapsedMinutes: number) {
    const status = incident.status;
    const newStatus = slaCheck.breached ? 'escalated' : status;

    if (slaCheck.breached && status !== 'escalated') {
      await this.prisma.incident.update({
        where: { id: incident.id },
        data: { status: 'escalated' },
      });

      await this.prisma.notification.create({
        data: {
          userId: incident.assigneeId || 'system',
          title: `SLA Breach: ${incident.title}`,
          message: `Incident ${incident.title} has breached SLA after ${elapsedMinutes} minutes. Status escalated.`,
          type: 'sla_breach',
        },
      });
    } else if (slaCheck.warning && status !== 'escalated') {
      await this.prisma.notification.create({
        data: {
          userId: incident.assigneeId || 'system',
          title: `SLA Warning: ${incident.title}`,
          message: `Incident ${incident.title} approaching SLA limit (${elapsedMinutes} minutes elapsed).`,
          type: 'sla_warning',
        },
      });
    }
  }

  private async handleRequestSlaAlert(request: any, slaCheck: { warning: boolean; breached: boolean }, elapsedMinutes: number) {
    if (slaCheck.breached) {
      await this.prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `SLA Breach: Request ${request.title}`,
          message: `Request has breached SLA after ${elapsedMinutes} minutes.`,
          type: 'sla_breach',
        },
      });
    } else if (slaCheck.warning) {
      await this.prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `SLA Warning: Request ${request.title}`,
          message: `Request approaching SLA limit (${elapsedMinutes} minutes elapsed).`,
          type: 'sla_warning',
        },
      });
    }
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}