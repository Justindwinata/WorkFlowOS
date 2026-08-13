import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SlaService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, responseTarget: number, resolutionTarget: number, warningThreshold: number) {
    return this.prisma.sLA.create({
      data: { name, responseTarget, resolutionTarget, warningThreshold },
    });
  }

  async findAll() {
    return this.prisma.sLA.findMany({ orderBy: { name: 'asc' } });
  }

  async findByName(name: string) {
    return this.prisma.sLA.findUnique({ where: { name } });
  }

  async checkBreach(slaName: string, elapsedMinutes: number): Promise<{ warning: boolean; breached: boolean }> {
    const sla = await this.findByName(slaName);
    if (!sla) return { warning: false, breached: false };

    const warning = elapsedMinutes >= sla.warningThreshold;
    const breached = elapsedMinutes >= sla.resolutionTarget;

    return { warning, breached };
  }
}
