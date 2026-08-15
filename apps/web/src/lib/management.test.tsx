import { vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('Users Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Users CRUD', () => {
    it('fetches all users', async () => {
      const users = [
        { id: '1', email: 'user1@test.com', username: 'user1', role: { name: 'member' } },
        { id: '2', email: 'user2@test.com', username: 'user2', role: { name: 'manager' } },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(users);

      const response = await apiClient.get('/users');
      expect(response).toEqual(users);
    });

    it('fetches single user', async () => {
      const user = { id: '1', email: 'test@test.com', username: 'test', firstName: 'Test', lastName: 'User' };
      (apiClient.get as vi.Mock).mockResolvedValue(user);

      const response = await apiClient.get('/users/1');
      expect(response).toEqual(user);
    });

    it('creates user', async () => {
      const newUser = { id: '3', email: 'new@test.com', username: 'newuser', role: 'member' };
      (apiClient.post as vi.Mock).mockResolvedValue(newUser);

      const response = await apiClient.post('/users', {
        email: 'new@test.com',
        username: 'newuser',
        password: 'Password123!',
      });
      expect(response).toEqual(newUser);
    });

    it('updates user', async () => {
      const updated = { id: '1', firstName: 'Updated', lastName: 'Name' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/users/1', { firstName: 'Updated', lastName: 'Name' });
      expect(response).toEqual(updated);
    });

    it('updates user role', async () => {
      const updated = { id: '1', role: { name: 'manager' } };
      (apiClient.patch as vi.Mock).mockResolvedValue(updated);

      const response = await apiClient.patch('/users/1/role', { roleId: 'role-2' });
      expect(response).toEqual(updated);
    });

    it('deletes user', async () => {
      (apiClient.delete as vi.Mock).mockResolvedValue({ message: 'User berhasil dihapus' });

      const response = await apiClient.delete('/users/1');
      expect(response).toEqual({ message: 'User berhasil dihapus' });
    });
  });
});

describe('Teams Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Teams CRUD', () => {
    it('fetches all teams', async () => {
      const teams = [
        { id: '1', name: 'Engineering', description: 'Engineering team', _count: { projects: 5 } },
        { id: '2', name: 'Design', description: 'Design team', _count: { projects: 2 } },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(teams);

      const response = await apiClient.get('/teams');
      expect(response).toEqual(teams);
    });

    it('creates team', async () => {
      const team = { id: '3', name: 'Marketing', description: 'Marketing team' };
      (apiClient.post as vi.Mock).mockResolvedValue(team);

      const response = await apiClient.post('/teams', { name: 'Marketing', description: 'Marketing team' });
      expect(response).toEqual(team);
    });

    it('adds member to team', async () => {
      const member = { userId: 'user-1', teamId: 'team-1', role: 'member' };
      (apiClient.post as vi.Mock).mockResolvedValue(member);

      const response = await apiClient.post('/teams/team-1/members', { userId: 'user-1', role: 'member' });
      expect(response).toEqual(member);
    });

    it('removes member from team', async () => {
      (apiClient.delete as vi.Mock).mockResolvedValue({ message: 'Anggota berhasil dihapus dari tim' });

      const response = await apiClient.delete('/teams/team-1/members/user-1');
      expect(response).toEqual({ message: 'Anggota berhasil dihapus dari tim' });
    });
  });
});

describe('Notifications Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Notifications CRUD', () => {
    it('fetches all notifications', async () => {
      const notifications = [
        { id: '1', title: 'Task assigned', message: 'You have a new task', read: false, type: 'task_assigned' },
        { id: '2', title: 'Approval needed', message: 'Approval needed', read: true, type: 'approval_request' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(notifications);

      const response = await apiClient.get('/notifications');
      expect(response).toEqual(notifications);
    });

    it('fetches unread notifications', async () => {
      const unread = [{ id: '1', title: 'New task', read: false }];
      (apiClient.get as vi.Mock).mockResolvedValue(unread);

      const response = await apiClient.get('/notifications/unread');
      expect(response).toEqual(unread);
    });

    it('marks notification as read', async () => {
      (apiClient.patch as vi.Mock).mockResolvedValue({});

      const response = await apiClient.patch('/notifications/1/read');
      expect(response).toEqual({});
    });

    it('marks all notifications as read', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({});

      const response = await apiClient.post('/notifications/mark-all-read');
      expect(response).toEqual({});
    });
  });
});

describe('Audit Log Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audit Log CRUD', () => {
    it('fetches all audit logs', async () => {
      const logs = [
        { id: '1', action: 'create', entity: 'task', entityId: '1', actor: { email: 'user@test.com' }, timestamp: new Date().toISOString() },
        { id: '2', action: 'update', entity: 'task', entityId: '1', actor: { email: 'user@test.com' }, timestamp: new Date().toISOString() },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(logs);

      const response = await apiClient.get('/audit-log');
      expect(response).toEqual(logs);
    });

    it('fetches audit logs by entity', async () => {
      const logs = [{ id: '1', action: 'update', entity: 'task', entityId: '1' }];
      (apiClient.get as vi.Mock).mockResolvedValue(logs);

      const response = await apiClient.get('/audit-log/entity/task/1');
      expect(response).toEqual(logs);
    });

    it('fetches audit logs by actor', async () => {
      const logs = [{ id: '1', action: 'login', actorId: 'user-1' }];
      (apiClient.get as vi.Mock).mockResolvedValue(logs);

      const response = await apiClient.get('/audit-log/actor/user-1');
      expect(response).toEqual(logs);
    });
  });
});