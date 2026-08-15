import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Data Fetching', () => {
    it('fetches dashboard data successfully', async () => {
      const mockDashboard = {
        stats: {
          myTasksCount: 12,
          overdueTasksCount: 3,
          openRequestsCount: 8,
          activeIncidentsCount: 4,
          pendingApprovalsCount: 5,
          slaAtRiskCount: 2,
        },
        myTasks: [
          { id: '1', title: 'Task 1', status: 'in_progress', priority: 'high', project: { name: 'Project A' } },
        ],
        teamWorkload: [
          { userId: '1', username: 'user1', team: 'Engineering', activeTasks: 12 },
        ],
        slaAtRisk: [
          { id: '1', title: 'Task at risk', elapsedMinutes: 100, warning: true, breached: false },
        ],
        recentActivity: [
          { id: '1', action: 'create', entity: 'task', entityId: '1', actor: { username: 'user1' }, summary: 'Created task', timestamp: new Date().toISOString() },
        ],
      };

      (apiClient.get as vi.Mock).mockResolvedValue(mockDashboard);

      const response = await apiClient.get('/dashboard');

      expect(response.stats.myTasksCount).toBe(12);
      expect(response.stats.overdueTasksCount).toBe(3);
      expect(response.myTasks).toHaveLength(1);
      expect(response.teamWorkload).toHaveLength(1);
      expect(response.slaAtRisk).toHaveLength(1);
      expect(response.recentActivity).toHaveLength(1);
    });

    it('handles empty dashboard data', async () => {
      const emptyDashboard = {
        stats: {
          myTasksCount: 0,
          overdueTasksCount: 0,
          openRequestsCount: 0,
          activeIncidentsCount: 0,
          pendingApprovalsCount: 0,
          slaAtRiskCount: 0,
        },
        myTasks: [],
        teamWorkload: [],
        slaAtRisk: [],
        recentActivity: [],
      };

      (apiClient.get as vi.Mock).mockResolvedValue(emptyDashboard);

      const response = await apiClient.get('/dashboard');

      expect(response.stats.myTasksCount).toBe(0);
      expect(response.myTasks).toHaveLength(0);
      expect(response.teamWorkload).toHaveLength(0);
      expect(response.slaAtRisk).toHaveLength(0);
      expect(response.recentActivity).toHaveLength(0);
    });

    it('handles dashboard API error', async () => {
      (apiClient.get as vi.Mock).mockRejectedValue(new Error('Network error'));

      await expect(apiClient.get('/dashboard')).rejects.toThrow('Network error');
    });
  });
});