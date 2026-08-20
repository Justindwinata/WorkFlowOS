import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: RedisClientType | null = null;

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
      memory: process.memoryUsage(),
    };
  }

  async readiness() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch (e) {
      checks.database = 'down';
      this.logger.error('DB health check failed', e);
    }

    try {
      const migrations = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT count(*)::int as count FROM _prisma_migrations WHERE finished_at IS NOT NULL
      `;
      checks.schema = `${Number(migrations[0]?.count) || 0} migrations applied`;
    } catch {
      checks.schema = 'unknown';
    }

    try {
      if (this.config.get('REDIS_URL')) {
        await this.checkRedis();
        checks.redis = 'up';
      } else {
        checks.redis = 'not_configured';
      }
    } catch {
      checks.redis = 'down';
    }

    const ready = checks.database === 'up' && (checks.redis !== 'down');

    return {
      status: ready ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  async startup() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch (e) {
      checks.database = 'down';
      this.logger.error('DB startup check failed', e);
    }

    try {
      if (this.config.get('REDIS_URL')) {
        await this.checkRedis();
        checks.redis = 'up';
      } else {
        checks.redis = 'not_configured';
      }
    } catch {
      checks.redis = 'down';
    }

    return {
      status: checks.database === 'up' ? 'started' : 'starting',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkRedis(): Promise<void> {
    if (!this.redisClient) {
      this.redisClient = createClient({
        url: this.config.get('REDIS_URL'),
        socket: { connectTimeout: 3000, reconnectStrategy: (retries) => Math.min(retries * 50, 500) },
      });
    }
    if (this.redisClient.isReady) {
      await this.redisClient.ping();
      return;
    }
    await this.redisClient.connect();
    await this.redisClient.ping();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}