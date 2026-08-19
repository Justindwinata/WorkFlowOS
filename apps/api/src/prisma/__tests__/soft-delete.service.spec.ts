import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteService } from '../soft-delete.service';
import { PrismaService } from '../prisma.service';

describe('SoftDeleteService', () => {
  let service: SoftDeleteService;
  let middlewareFn: any;

  const mockPrisma = {
    $use: jest.fn((fn: any) => {
      middlewareFn = fn;
    }),
  } as any;

  beforeEach(async () => {
    middlewareFn = null;
    (mockPrisma.$use as jest.Mock).mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SoftDeleteService>(SoftDeleteService);
  });

  it('should register Prisma middleware', () => {
    expect(mockPrisma.$use).toHaveBeenCalledTimes(1);
    expect(middlewareFn).toBeDefined();
  });

  describe('Read filters', () => {
    it('adds deletedAt: null to findUnique for soft-delete models', async () => {
      const params = {
        model: 'User',
        action: 'findUnique',
        args: { where: { id: 'user-1' } },
      };

      const result = await middlewareFn(params, () => Promise.resolve({ id: 'user-1' }));
      expect(result).toEqual({ id: 'user-1' });
    });

    it('converts findUnique to findFirst for soft-delete models', async () => {
      const next = jest.fn().mockResolvedValue({ id: 'user-1' });
      const params = {
        model: 'Task',
        action: 'findUnique',
        args: { where: { id: 'task-1' } },
      };

      await middlewareFn(params, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'findFirst' }),
      );
    });

    it('adds deletedAt: null to findMany for soft-delete models', async () => {
      const next = jest.fn().mockResolvedValue([]);
      const params = {
        model: 'Project',
        action: 'findMany',
        args: { where: { workspaceId: 'ws-1' } },
      };

      await middlewareFn(params, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({
            where: expect.objectContaining({ deletedAt: null }),
          }),
        }),
      );
    });

    it('skips models not in SOFT_DELETE_MODELS', async () => {
      const next = jest.fn().mockResolvedValue([]);
      const params = {
        model: 'Notification',
        action: 'findFirst',
        args: { where: { id: 'n-1' } },
      };

      await middlewareFn(params, next);
      expect(next).toHaveBeenCalledWith(params);
    });

    it('does not override existing deletedAt filter', async () => {
      const next = jest.fn().mockResolvedValue(null);
      const params = {
        model: 'Request',
        action: 'findUnique',
        args: { where: { id: 'r-1', deletedAt: null } },
      };

      await middlewareFn(params, next);
      const callArgs = next.mock.calls[0][0];
      expect(callArgs.args.where.deletedAt).toBe(null);
    });
  });

  describe('Write interceptors', () => {
    it('converts delete to soft delete (update with deletedAt)', async () => {
      const next = jest.fn().mockResolvedValue({ id: 'task-1' });
      const params = {
        model: 'Task',
        action: 'delete',
        args: { where: { id: 'task-1' } },
      };

      const result = await middlewareFn(params, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update',
          args: expect.objectContaining({
            data: expect.objectContaining({ deletedAt: expect.any(Date) }),
          }),
        }),
      );
      expect(result).toEqual({ id: 'task-1' });
    });

    it('converts deleteMany to updateMany with deletedAt', async () => {
      const next = jest.fn().mockResolvedValue({ count: 3 });
      const params = {
        model: 'Incident',
        action: 'deleteMany',
        args: { where: { status: 'closed' } },
      };

      await middlewareFn(params, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updateMany',
          args: expect.objectContaining({
            data: expect.objectContaining({ deletedAt: expect.any(Date) }),
          }),
        }),
      );
    });
  });
});
