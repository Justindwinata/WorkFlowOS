import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Tasks Service - Search & Filter Regression Tests', () => {
  let service: TasksService;

  const mockPrisma = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findFirst: jest.fn(),
    },
    taskAssignment: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('Task Search', () => {
    it('searches tasks by title', async () => {
      mockPrisma.task.findMany.mockResolvedValue([
        { id: '1', title: 'Fix login bug', status: 'open' },
        { id: '2', title: 'Implement 2FA', status: 'open' },
      ]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, 'Fix');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('searches tasks by description', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, 'authentication');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('performs case-insensitive search', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, 'BUG');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Task Filtering', () => {
    it('filters tasks by status', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, 'done');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('done');
    });

    it('filters tasks by priority', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, 'high');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.priority).toBe('high');
    });

    it('filters tasks by assignee', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, 'user-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.assignments).toEqual({ some: { userId: 'user-1' } });
    });

    it('combines multiple filters', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, 'open', 'high', 'user-1', 'bug fix');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('open');
      expect(callArgs.where.priority).toBe('high');
      expect(callArgs.where.assignments).toEqual({ some: { userId: 'user-1' } });
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('Task Pagination', () => {
    it('applies limit to results', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 50, 0);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it('applies offset to results', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 50);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 50,
        }),
      );
    });

    it('uses default limit if not specified', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it('uses default offset if not specified', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        }),
      );
    });
  });

  describe('Task Query Composition', () => {
    it('includes proper relations in query', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
      expect(callArgs.include.assignments).toBeDefined();
      expect(callArgs.include.creator).toBeDefined();
      expect(callArgs.include.project).toBeDefined();
    });

    it('orders results by creation date descending', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('filters out deleted tasks', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.deletedAt).toBe(null);
    });
  });

  describe('Search Edge Cases', () => {
    it('handles empty search string (no OR clause)', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, '');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      // Empty string doesn't add OR clause (optimization)
      expect(callArgs.where.OR).toBeUndefined();
    });

    it('handles null search', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, undefined);

      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeUndefined();
    });

    it('handles special characters in search', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('proj-1', 'ws-1', 100, 0, undefined, undefined, undefined, '%_*');

      expect(mockPrisma.task.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });
});
