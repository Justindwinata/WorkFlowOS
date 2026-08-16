import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async check() {
    return {
      status: 'ok',
      service: 'workflowos-api',
      version: this.config.get('npm_package_version') || '0.1.0',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async readiness() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch {
      checks.database = 'down';
    }

    try {
      const migrations = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT count(*)::int as count FROM _prisma_migrations WHERE finished_at IS NOT NULL
      `;
      checks.schema = `${Number(migrations[0]?.count) || 0} migrations applied`;
    } catch {
      checks.schema = 'unknown';
    }

    const ready = checks.database === 'up';

    return {
      status: ready ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}