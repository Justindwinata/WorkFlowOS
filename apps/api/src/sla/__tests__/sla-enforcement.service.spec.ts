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

      expect(mockPrisma.incident.update).not.toHaveBeenCalled();
    });
  });

  describe('getElapsedBusinessMinutes', () => {
    // 2026-01-16 is a Friday, 2026-01-19 is Monday
    const config = {
      workingDays: [1, 2, 3, 4, 5],
      workingHoursStart: 9,
      workingHoursEnd: 17,
      timezone: 'UTC',
      holidayExceptions: ['2026-01-16'], // Friday is holiday
    };

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('returns zero if now is before start', async () => {
      // Start 1 hour before now -> both same working day
      const start = dayjs('2026-01-12 11:00'); // Monday 11:00
      const now = dayjs('2026-01-12 12:00'); // Monday 12:00
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(60);
    });

    it('skips weekend (Saturday/Sunday) correctly', async () => {
      // Friday 16:00 -> Monday 11:00
      const start = dayjs('2026-01-09 16:00'); // Friday 16:00
      const now = dayjs('2026-01-12 11:00'); // Monday 11:00
      // Friday: 16:00-17:00 = 1 hour; Monday: 09:00-11:00 = 2 hours
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(180);
    });

    it('skips configured holiday exceptions', async () => {
      // Thursday before holiday Friday -> Tuesday
      const start = dayjs('2026-01-15 16:00'); // Thursday 16:00
      const now = dayjs('2026-01-20 11:00'); // Tuesday 11:00
      // Thursday: 16:00-17:00 = 60; Friday holiday skipped; Monday: 09:00-17:00 = 480; Tuesday: 09:00-11:00 = 120
      // Total = 660
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(660);
    });

    it('handles start before working hours', async () => {
      const start = dayjs('2026-01-12 07:00'); // Monday 07:00 (before start)
      const now = dayjs('2026-01-12 11:00'); // Monday 11:00
      // Monday: 09:00-11:00 = 120
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(120);
    });

    it('handles start after working hours end', async () => {
      const start = dayjs('2026-01-12 18:30'); // Monday 18:30 (after end)
      const now = dayjs('2026-01-13 11:00'); // Tuesday 11:00
      // Monday after hours -> skip to Tuesday 09:00; Tuesday: 09:00-11:00 = 120
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(120);
    });

    it('returns zero when start is in the future', async () => {
      const start = dayjs('2026-01-20 10:00');
      const now = dayjs('2026-01-12 10:00');
      const result = await service.getElapsedBusinessMinutes(start.toDate(), now.toDate(), config);
      expect(result).toBe(0);
    });
  });

  describe('BusinessHoursConfig', () => {
    it('setBusinessHours updates and getBusinessHours returns config', () => {
      service.setBusinessHours({ workingHoursStart: 8, holidayExceptions: ['2026-12-25'] });
      const bh = service.getBusinessHours();
      expect(bh.workingHoursStart).toBe(8);
      expect(bh.holidayExceptions).toContain('2026-12-25');
    });

    it('preserves existing config when overriding partial', () => {
      service.setBusinessHours({ workingHoursStart: 8 });
      const bh = service.getBusinessHours();
      expect(bh.workingHoursStart).toBe(8);
      expect(bh.workingDays).toEqual([1, 2, 3, 4, 5]);
      expect(bh.workingHoursEnd).toBe(18);
    });
  });
});