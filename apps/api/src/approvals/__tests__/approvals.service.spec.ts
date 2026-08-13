import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalsService } from '../approvals.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ApprovalsService', () => {
  let service: ApprovalsService;

  const mockPrisma = {
    request: { findUnique: jest.fn() },
    approval: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovalsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ApprovalsService>(ApprovalsService);
  });

  describe('create', () => {
    it('should throw if request not found', async () => {
      mockPrisma.request.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ requestId: 'r1' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if approval already exists', async () => {
      mockPrisma.request.findUnique.mockResolvedValue({ id: 'r1' });
      mockPrisma.approval.findUnique.mockResolvedValue({ id: 'a1' });
      await expect(service.create({ requestId: 'r1' }, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create approval', async () => {
      mockPrisma.request.findUnique.mockResolvedValue({ id: 'r1' });
      mockPrisma.approval.findUnique.mockResolvedValue(null);
      mockPrisma.approval.create.mockResolvedValue({ id: 'a1', status: 'pending' });

      const result = await service.create({ requestId: 'r1', comment: 'Please review' }, 'user-1');
      expect(result.id).toBe('a1');
      expect(result.status).toBe('pending');
    });
  });
});
