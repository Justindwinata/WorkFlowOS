import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Health Endpoints - Regression Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health (liveness)', () => {
    it('returns 200 with service info', async () => {
      const response = await request(app.getHttpServer()).get('/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('workflowos-api');
      expect(response.body.version).toBeDefined();
      expect(response.body.nodeVersion).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.memory).toBeDefined();
    });

    it('returns consistent structure on repeated calls', async () => {
      const r1 = await request(app.getHttpServer()).get('/health');
      const r2 = await request(app.getHttpServer()).get('/health');

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      expect(r1.body.service).toBe(r2.body.service);
      expect(r1.body.status).toBe(r2.body.status);
    });
  });

  describe('GET /readiness', () => {
    it('returns ready when database is up', async () => {
      const response = await request(app.getHttpServer()).get('/readiness').expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.checks.database).toBe('up');
      expect(response.body.checks.schema).toContain('migrations applied');
    });

    it('returns checks for redis if configured', async () => {
      const response = await request(app.getHttpServer()).get('/readiness');

      expect(response.body.checks.redis).toBeDefined();
      expect(['up', 'not_configured', 'down']).toContain(response.body.checks.redis);
    });
  });

  describe('GET /startup', () => {
    it('returns started when database is up', async () => {
      const response = await request(app.getHttpServer()).get('/startup').expect(200);

      expect(response.body.status).toBe('started');
      expect(response.body.checks.database).toBe('up');
    });

    it('includes redis check', async () => {
      const response = await request(app.getHttpServer()).get('/startup');

      expect(response.body.checks.redis).toBeDefined();
    });
  });

  describe('Health Endpoint Security', () => {
    it('does not expose sensitive configuration', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.body).not.toHaveProperty('JWT_ACCESS_SECRET');
      expect(response.body).not.toHaveProperty('JWT_REFRESH_SECRET');
      expect(response.body).not.toHaveProperty('DATABASE_URL');
    });

    it('returns proper content-type', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});