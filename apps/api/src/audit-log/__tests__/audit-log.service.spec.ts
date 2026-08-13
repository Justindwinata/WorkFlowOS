import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockPrisma = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create audit log entry', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'log-1',
        action: 'create',
        entity: 'task',
        entityId: 'task-1',
        actorId: 'user-1',
        summary: 'Created task',
        timestamp: new Date(),
      });

      const result = await service.create('create', 'task', 'task-1', 'user-1', 'Created task');
      expect(result.id).toBe('log-1');
    });
  });

  describe('findAll', () => {
    it('should return audit logs for workspace', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const result = await service.findAll('workspace-1');
      expect(result).toEqual([]);
    });
  });
});
