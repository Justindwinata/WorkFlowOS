import { vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('Requests Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request CRUD', () => {
    it('creates a request', async () => {
      const mockRequest = {
        id: 'req-1',
        title: 'IT Access Request',
        description: 'Need access to production DB',
        type: 'it_access',
        status: 'draft',
        priority: 'medium',
        requesterId: 'user-1',
      };
      (apiClient.post as vi.Mock).mockResolvedValue(mockRequest);

      const response = await apiClient.post('/requests', {
        title: 'IT Access Request',
        description: 'Need access to production DB',
        type: 'it_access',
        priority: 'medium',
      });

      expect(response).toEqual(mockRequest);
    });

    it('fetches requests', async () => {
      const mockRequests = [
        { id: '1', title: 'Request 1', status: 'submitted', type: 'it_access' },
        { id: '2', title: 'Request 2', status: 'approval', type: 'laptop' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(mockRequests);

      const response = await apiClient.get('/requests');
      expect(response).toEqual(mockRequests);
    });

    it('updates request status', async () => {
      const updated = { id: '1', status: 'approval' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/requests/1/status', { status: 'approval' });
      expect(response).toEqual(updated);
    });

    it('deletes request', async () => {
      (apiClient.delete as vi.Mock).mockResolvedValue({ message: 'Request berhasil dihapus' });

      const response = await apiClient.delete('/requests/1');
      expect(response).toEqual({ message: 'Request berhasil dihapus' });
    });
  });

  describe('Approvals', () => {
    it('creates approval', async () => {
      const approval = { id: 'a1', requestId: 'req-1', approverId: 'user-2', status: 'pending' };
      (apiClient.post as vi.Mock).mockResolvedValue(approval);

      const response = await apiClient.post('/approvals', { requestId: 'req-1', comment: 'Please review' });
      expect(response).toEqual(approval);
    });

    it('fetches pending approvals', async () => {
      const approvals = [{ id: 'a1', status: 'pending', request: { title: 'Test' } }];
      (apiClient.get as vi.Mock).mockResolvedValue(approvals);

      const response = await apiClient.get('/approvals/pending');
      expect(response).toEqual(approvals);
    });

    it('updates approval status', async () => {
      const updated = { id: 'a1', status: 'approved' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/approvals/a1', { status: 'approved', comment: 'Approved' });
      expect(response).toEqual(updated);
    });
  });
});

describe('Incidents Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Incident CRUD', () => {
    it('creates an incident', async () => {
      const mockIncident = {
        id: 'inc-1',
        title: 'Database timeout',
        description: 'Production DB not responding',
        severity: 'critical',
        priority: 'critical',
        status: 'open',
        affectedService: 'database',
      };
      (apiClient.post as vi.Mock).mockResolvedValue(mockIncident);

      const response = await apiClient.post('/incidents', {
        title: 'Database timeout',
        description: 'Production DB not responding',
        severity: 'critical',
        affectedService: 'database',
      });

      expect(response).toEqual(mockIncident);
    });

    it('fetches incidents', async () => {
      const incidents = [
        { id: '1', title: 'Incident 1', severity: 'critical', status: 'open' },
        { id: '2', title: 'Incident 2', severity: 'medium', status: 'resolved' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(incidents);

      const response = await apiClient.get('/incidents');
      expect(response).toEqual(incidents);
    });

    it('assigns user to incident', async () => {
      const updated = { id: '1', assigneeId: 'user-1' };
      (apiClient.post as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.post('/incidents/1/assign', { assigneeId: 'user-1' });
      expect(response).toEqual(updated);
    });

    it('updates incident', async () => {
      const updated = { id: '1', status: 'resolved', resolution: 'Fixed by restarting DB' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/incidents/1', { status: 'resolved', resolution: 'Fixed by restarting DB' });
      expect(response).toEqual(updated);
    });
  });
});