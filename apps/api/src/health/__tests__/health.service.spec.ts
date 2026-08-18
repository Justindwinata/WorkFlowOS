import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Health Service - Regression Tests', () => {
  let service: HealthService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'npm_package_version') return '0.1.0';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe('Liveness Check', () => {
    it('returns ok with service metadata', async () => {
      const result = await service.check();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('workflowos-api');
      expect(result.version).toBeDefined();
      expect(result.nodeVersion).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.memory).toBeDefined();
    });

    it('includes memory usage info', async () => {
      const result = await service.check();
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
    });
  });

  describe('Readiness Check', () => {
    it('returns ready when database is up', async () => {
      prisma.$queryRaw.mockResolvedValueOnce(undefined);
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 5 }]);

      const result = await service.readiness();

      expect(result.status).toBe('ready');
      expect(result.checks.database).toBe('up');
      expect(result.checks.schema).toContain('migrations');
    });

    it('returns not_ready when database is down', async () => {
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Connection failed'));
      prisma.$queryRaw.mockRejectedValueOnce(new Error('Migration query failed'));

      const result = await service.readiness();

      expect(result.status).toBe('not_ready');
      expect(result.checks.database).toBe('down');
    });
  });

  describe('Startup Check', () => {
    it('returns started when database is up', async () => {
      prisma.$queryRaw.mockResolvedValueOnce(undefined);

      const result = await service.startup();

      expect(result.status).toBe('started');
      expect(result.checks.database).toBe('up');
    });
  });

  describe('Security Properties', () => {
    it('does not expose secrets in health response', async () => {
      const result = await service.check();
      expect(result).not.toHaveProperty('secrets');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('jwt');
    });

    it('includes timestamp for traceability', async () => {
      const result = await service.check();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
