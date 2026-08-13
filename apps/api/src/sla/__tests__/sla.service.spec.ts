import { Test, TestingModule } from '@nestjs/testing';
import { SlaService } from '../sla.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SlaService', () => {
  let service: SlaService;

  const mockPrisma = {
    sLA: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SlaService>(SlaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkBreach', () => {
    it('should return warning and breach status based on elapsed time', async () => {
      mockPrisma.sLA.findUnique.mockResolvedValue({
        id: '1',
        name: 'Critical',
        responseTarget: 15,
        resolutionTarget: 120,
        warningThreshold: 90,
      });

      const resultNormal = await service.checkBreach('Critical', 30);
      expect(resultNormal.warning).toBe(false);
      expect(resultNormal.breached).toBe(false);

      const resultWarning = await service.checkBreach('Critical', 95);
      expect(resultWarning.warning).toBe(true);
      expect(resultWarning.breached).toBe(false);

      const resultBreached = await service.checkBreach('Critical', 130);
      expect(resultBreached.warning).toBe(true);
      expect(resultBreached.breached).toBe(true);
    });
  });
});
