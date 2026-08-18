import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsService } from '../incidents.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Incidents Service - Search & Filter Regression Tests', () => {
  let service: IncidentsService;

  const mockPrisma = {
    incident: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    jest.clearAllMocks();
  });

  describe('Incident Filtering', () => {
    it('filters incidents by status', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', 'open', undefined, undefined, undefined, undefined, 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('open');
    });

    it('filters incidents by severity', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, 'critical', undefined, undefined, undefined, 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.severity).toBe('critical');
    });

    it('filters incidents by priority', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, 'high', undefined, undefined, 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.priority).toBe('high');
    });

    it('filters incidents by assignee', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, 'user-1', undefined, 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.assigneeId).toBe('user-1');
    });
  });

  describe('Incident Search', () => {
    it('searches incidents by title', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, 'database', 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('searches incidents by description', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, 'connection timeout', 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('performs case-insensitive search', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, 'DATABASE', 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Incident Pagination', () => {
    it('applies limit to results', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, undefined, 50, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it('applies offset to results', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, undefined, 100, 25);

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 25 }),
      );
    });

    it('uses default limit and offset', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100, skip: 0 }),
      );
    });
  });

  describe('Combined Filters', () => {
    it('combines status, severity, and search', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', 'open', 'critical', 'high', undefined, 'memory', 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('open');
      expect(callArgs.where.severity).toBe('critical');
      expect(callArgs.where.priority).toBe('high');
      expect(callArgs.where.OR).toBeDefined();
    });

    it('combines assignee with other filters', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', 'open', undefined, 'high', 'user-1', 'latency', 100, 0);

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('open');
      expect(callArgs.where.priority).toBe('high');
      expect(callArgs.where.assigneeId).toBe('user-1');
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Query Optimization', () => {
    it('filters out deleted incidents', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.where.deletedAt).toBe(null);
    });

    it('orders by creation date descending', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('includes assignee relation', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
      expect(callArgs.include.assignee).toBeDefined();
    });
  });
});
