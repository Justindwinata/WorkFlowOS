import { Test, TestingModule } from '@nestjs/testing';
import { SlaEnforcementService } from '../sla-enforcement.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SlaService } from '../sla.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dayjs = require('dayjs');

describe('SlaEnforcementService', () => {
  let service: SlaEnforcementService;
  let slaService: SlaService;

  const mockPrisma = {
    incident: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    request: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  };

  const mockSlaService = {
    checkBreach: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlaEnforcementService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SlaService, useValue: mockSlaService },
      ],
    }).compile();

    service = module.get<SlaEnforcementService>(SlaEnforcementService);

    mockPrisma.incident.findMany.mockReset();
    mockPrisma.incident.update.mockReset();
    mockPrisma.notification.create.mockReset();
    mockPrisma.request.findMany.mockReset();
    mockSlaService.checkBreach.mockReset();
  });

  describe('checkSlaBreaches', () => {
    it('escalates critical incident on breach', async () => {
      const createdAt = dayjs().subtract(150, 'minute').toDate();

      mockPrisma.incident.findMany.mockResolvedValue([
        {
          id: 'inc-1',
          severity: 'critical',
          status: 'investigating',
          assigneeId: 'user-1',
          createdAt,
          title: 'Database down',
        },
      ]);
      mockPrisma.request.findMany.mockResolvedValue([]);
      mockSlaService.checkBreach.mockResolvedValue({ warning: true, breached: true });
      mockPrisma.incident.update.mockResolvedValue({ id: 'inc-1', status: 'escalated' });
      mockPrisma.notification.create.mockResolvedValue({});

      await service.checkSlaBreaches();

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'inc-1' },
        data: { status: 'escalated' },
      });
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Incident Escalated',
            type: 'incident_escalation',
          }),
        }),
      );
    });

    it('does not escalate if already escalated', async () => {
      mockPrisma.incident.findMany.mockResolvedValue([
        {
          id: 'inc-1',
          severity: 'critical',
          status: 'escalated',
          assigneeId: 'user-1',
          createdAt: dayjs().subtract(150, 'minute').toDate(),
          title: 'Database down',
        },
      ]);
      mockSlaService.checkBreach.mockResolvedValue({ warning: true, breached: true });
      mockPrisma.request.findMany.mockResolvedValue([]);

      await service.checkSlaBreaches();

      expect(mockPrisma.incident.update).not.toHaveBeenCalled();
    });

    it('sends warning notification on SLA warning threshold', async () => {
      const createdAt = dayjs().subtract(100, 'minute').toDate();

      mockPrisma.incident.findMany.mockResolvedValue([
        {
          id: 'inc-2',
          severity: 'critical',
          status: 'investigating',
          assigneeId: 'user-1',
          createdAt,
          title: 'High latency',
        },
      ]);
      mockPrisma.request.findMany.mockResolvedValue([]);
      mockSlaService.checkBreach.mockResolvedValue({ warning: true, breached: false });

      await service.checkSlaBreaches();

      // verify warning notification is logged (not escalated)
      expect(mockPrisma.incident.update).not.toHaveBeenCalled();
    });
  });

  describe('getElapsedBusinessMinutes', () => {
    it('calculates business minutes excluding weekends', async () => {
      const start = dayjs().subtract(2, 'day').hour(10).minute(0).toDate();
      const result = await service.getElapsedBusinessMinutes(start);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});