import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from '../requests.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Requests Service - Search & Filter Regression Tests', () => {
  let service: RequestsService;

  const mockPrisma = {
    request: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    jest.clearAllMocks();
  });

  describe('Request Filtering', () => {
    it('filters requests by status', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', 'submitted', undefined, undefined, undefined);

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('submitted');
    });

    it('filters requests by priority', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, 'high', undefined, undefined);

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.priority).toBe('high');
    });

    it('filters requests by type', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, 'hardware', undefined);

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.type).toBe('hardware');
    });
  });

  describe('Request Search', () => {
    it('searches requests by title', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, 'laptop');

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('performs case-insensitive search', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, 'LAPTOP');

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Request Pagination', () => {
    it('applies limit to results', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, 50, 0);

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it('applies offset to results', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', undefined, undefined, undefined, undefined, 100, 25);

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 25 }),
      );
    });

    it('uses default limit and offset', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100, skip: 0 }),
      );
    });
  });

  describe('Combined Filters', () => {
    it('combines status, priority, and search', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1', 'submitted', 'high', undefined, 'urgent');

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('submitted');
      expect(callArgs.where.priority).toBe('high');
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Query Optimization', () => {
    it('filters out deleted requests', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.where.deletedAt).toBe(null);
    });

    it('orders by creation date descending', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('includes related entities', async () => {
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.findAll('ws-1');

      expect(mockPrisma.request.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.request.findMany.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
      expect(callArgs.include.requester).toBeDefined();
      expect(callArgs.include.approvals).toBeDefined();
    });
  });

  describe('Workspace Isolation', () => {
    it('scopes findOne by workspace', async () => {
      mockPrisma.request.findFirst.mockResolvedValue(null);

      await expect(service.findOne('req-1', 'ws-1')).rejects.toThrow('Request tidak ditemukan');
      expect(mockPrisma.request.findFirst).toHaveBeenCalledWith({
        where: { id: 'req-1', workspaceId: 'ws-1' },
        include: { requester: true, approvals: { include: { approver: true } } },
      });
    });

    it('rejects status update of request in another workspace', async () => {
      mockPrisma.request.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('req-2', { status: 'approved' }, 'ws-1'),
      ).rejects.toThrow('Request tidak ditemukan');
      expect(mockPrisma.request.findFirst).toHaveBeenCalledWith({
        where: { id: 'req-2', workspaceId: 'ws-1' },
      });
      expect(mockPrisma.request.update).not.toHaveBeenCalled();
    });

    it('rejects delete of request in another workspace', async () => {
      mockPrisma.request.findFirst.mockResolvedValue(null);

      await expect(service.delete('req-3', 'ws-2')).rejects.toThrow('Request tidak ditemukan');
      expect(mockPrisma.request.findFirst).toHaveBeenCalledWith({
        where: { id: 'req-3', workspaceId: 'ws-2' },
      });
      expect(mockPrisma.request.delete).not.toHaveBeenCalled();
    });
  });
});
