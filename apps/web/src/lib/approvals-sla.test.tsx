import { vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('Approvals Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Approvals CRUD', () => {
    it('fetches all approvals', async () => {
      const approvals = [
        { id: 'a1', status: 'pending', request: { title: 'Test Request' } },
        { id: 'a2', status: 'approved', request: { title: 'Approved Request' } },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(approvals);

      const response = await apiClient.get('/approvals');
      expect(response).toEqual(approvals);
    });

    it('fetches pending approvals', async () => {
      const pending = [
        { id: 'a1', status: 'pending', request: { title: 'Pending Request' } },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(pending);

      const response = await apiClient.get('/approvals/pending');
      expect(response).toEqual(pending);
    });

    it('fetches single approval', async () => {
      const approval = { id: 'a1', status: 'pending', request: { title: 'Test' } };
      (apiClient.get as vi.Mock).mockResolvedValue(approval);

      const response = await apiClient.get('/approvals/a1');
      expect(response).toEqual(approval);
    });

    it('creates approval', async () => {
      const approval = { id: 'a1', status: 'pending', comment: 'Please review' };
      (apiClient.post as vi.Mock).mockResolvedValue(approval);

      const response = await apiClient.post('/approvals', { requestId: 'r1', comment: 'Please review' });
      expect(response).toEqual(approval);
    });

    it('updates approval status', async () => {
      const updated = { id: 'a1', status: 'approved', comment: 'Approved' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/approvals/a1', { status: 'approved', comment: 'Approved' });
      expect(response).toEqual(updated);
    });

    it('handles approve action', async () => {
      (apiClient.patch as vi.Mock).mockResolvedValue({ status: 'approved' });

      const response = await apiClient.patch('/approvals/a1', { status: 'approved', comment: 'Approved' });
      expect(response.status).toBe('approved');
    });

    it('handles reject action', async () => {
      (apiClient.patch as vi.Mock).mockResolvedValue({ status: 'rejected' });

      const response = await apiClient.patch('/approvals/a1', { status: 'rejected', comment: 'Rejected' });
      expect(response.status).toBe('rejected');
    });

    it('handles request changes', async () => {
      (apiClient.patch as vi.Mock).mockResolvedValue({ status: 'changes_requested' });

      const response = await apiClient.patch('/approvals/a1', { status: 'changes_requested', comment: 'Need more info' });
      expect(response.status).toBe('changes_requested');
    });
  });

  describe('Approval History', () => {
    it('fetches approval history for request', async () => {
      const history = [
        { id: 'h1', stage: 'Manager Review', status: 'approved', comment: 'OK' },
        { id: 'h2', stage: 'Finance Review', status: 'pending', comment: '' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(history);

      const response = await apiClient.get('/approvals/request/r1/history');
      expect(response).toEqual(history);
    });
  });
});

describe('SLA Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SLA Definitions', () => {
    it('fetches all SLA definitions', async () => {
      const slas = [
        { id: '1', name: 'Critical', responseTarget: 15, resolutionTarget: 120, warningThreshold: 60 },
        { id: '2', name: 'High', responseTarget: 30, resolutionTarget: 240, warningThreshold: 120 },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(slas);

      const response = await apiClient.get('/sla');
      expect(response).toEqual(slas);
    });

    it('creates SLA definition', async () => {
      const sla = { name: 'Urgent', responseTarget: 10, resolutionTarget: 60, warningThreshold: 30 };
      (apiClient.post as vi.Mock).mockResolvedValue({ id: '1', ...sla });

      const response = await apiClient.post('/sla', sla);
      expect(response).toEqual({ id: '1', ...sla });
    });

    it('checks SLA breach status', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({ warning: false, breached: false });

      const response = await apiClient.get('/sla/Critical/check', { params: { elapsedMinutes: 30 } });
      expect(response.warning).toBe(false);
      expect(response.breached).toBe(false);
    });

    it('detects SLA warning', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({ warning: true, breached: false });

      const response = await apiClient.get('/sla/Critical/check', { params: { elapsedMinutes: 90 } });
      expect(response.warning).toBe(true);
      expect(response.breached).toBe(false);
    });

    it('detects SLA breach', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({ warning: true, breached: true });

      const response = await apiClient.get('/sla/Critical/check', { params: { elapsedMinutes: 150 } });
      expect(response.warning).toBe(true);
      expect(response.breached).toBe(true);
    });
  });

  describe('SLA Business Hours', () => {
    it('checks business hours status', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({ isBusinessHours: true });

      const response = await apiClient.get('/sla/business-hours/status');
      expect(response.isBusinessHours).toBe(true);
    });

    it('calculates business hours remaining', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue({ remainingMinutes: 480 });

      const response = await apiClient.get('/sla/business-hours/remaining');
      expect(response.remainingMinutes).toBe(480);
    });
  });

  describe('SLA Escalation', () => {
    it('creates escalation rule', async () => {
      const rule = { slaName: 'Critical', level: 1, notifyRole: 'manager', delayMinutes: 30 };
      (apiClient.post as vi.Mock).mockResolvedValue({ id: '1', ...rule });

      const response = await apiClient.post('/sla/escalation-rules', rule);
      expect(response).toEqual({ id: '1', ...rule });
    });

    it('fetches escalation rules', async () => {
      const rules = [
        { id: '1', slaName: 'Critical', level: 1, notifyRole: 'manager' },
        { id: '2', slaName: 'Critical', level: 2, notifyRole: 'director' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(rules);

      const response = await apiClient.get('/sla/escalation-rules');
      expect(response).toEqual(rules);
    });
  });
});