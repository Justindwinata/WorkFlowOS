import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    project: { findFirst: jest.fn() },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskAssignment: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('create', () => {
    it('should throw NotFoundException if project not found', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null);
      await expect(
        service.create(
          { title: 'Test', projectId: 'p1' },
          'user-1',
          'ws-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create task', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1' });
      mockPrisma.task.create.mockResolvedValue({
        id: 'task-1',
        title: 'Test',
        assignments: [],
        comments: [],
      });

      const result = await service.create(
        { title: 'Test', projectId: 'p1', priority: 'high' },
        'user-1',
        'ws-1',
      );

      expect(result.id).toBe('task-1');
      expect(mockPrisma.task.create).toHaveBeenCalled();
    });
  });
});
