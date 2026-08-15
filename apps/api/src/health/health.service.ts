import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      service: 'workflowos-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async readiness() {
    let dbStatus: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (e) {
      dbStatus = 'down';
    }

    const ready = dbStatus === 'up';

    return {
      status: ready ? 'ready' : 'not_ready',
      checks: {
        database: dbStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
