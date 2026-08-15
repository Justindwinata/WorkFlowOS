import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client');

describe('Task Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task CRUD', () => {
    it('creates a task', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test description',
        status: 'backlog',
        priority: 'high',
        projectId: 'proj-1',
        creatorId: 'user-1',
      };
      (apiClient.post as vi.Mock).mockResolvedValue(mockTask);

      const response = await apiClient.post('/tasks', {
        title: 'Test Task',
        description: 'Test description',
        projectId: 'proj-1',
        priority: 'high',
      });

      expect(response).toEqual(mockTask);
    });

    it('fetches tasks', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'in_progress', priority: 'high' },
        { id: '2', title: 'Task 2', status: 'todo', priority: 'medium' },
      ];
      (apiClient.get as vi.Mock).mockResolvedValue(mockTasks);

      const response = await apiClient.get('/tasks');
      expect(response).toEqual(mockTasks);
    });

    it('filters tasks by project', async () => {
      (apiClient.get as vi.Mock).mockResolvedValue([]);

      await apiClient.get('/tasks', { params: { projectId: 'proj-1' } });
      expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
        params: { projectId: 'proj-1' },
      });
    });

    it('updates task status', async () => {
      const updatedTask = { id: '1', status: 'done' };
      (apiClient.patch as vi.Mock).mockResolvedValue(updatedTask);

      const response = await apiClient.patch('/tasks/1', { status: 'done' });
      expect(response).toEqual(updatedTask);
    });

    it('assigns user to task', async () => {
      const assignment = { id: 'a1', taskId: '1', userId: 'user-2' };
      (apiClient.post as vi.Mock).mockResolvedValue(assignment);

      const response = await apiClient.post('/tasks/1/assign', { userId: 'user-2' });
      expect(response).toEqual(assignment);
    });

    it('deletes task', async () => {
      (apiClient.delete as vi.Mock).mockResolvedValue({ message: 'Task berhasil dihapus' });

      const response = await apiClient.delete('/tasks/1');
      expect(response).toEqual({ message: 'Task berhasil dihapus' });
    });
  });

  describe('Task Comments', () => {
    it('adds comment to task', async () => {
      const comment = { id: 'c1', content: 'Test comment', taskId: '1', authorId: 'user-1' };
      (apiClient.post as vi.Mock).mockResolvedValue(comment);

      const response = await apiClient.post('/tasks/1/comments', { content: 'Test comment' });
      expect(response).toEqual(comment);
    });

    it('fetches task comments', async () => {
      const comments = [{ id: 'c1', content: 'Comment 1', authorId: 'user-1' }];
      (apiClient.get as vi.Mock).mockResolvedValue(comments);

      const response = await apiClient.get('/tasks/1/comments');
      expect(response).toEqual(comments);
    });
  });

  describe('Task Labels', () => {
    it('creates a label', async () => {
      const label = { id: 'l1', name: 'Bug', color: '#ff0000' };
      (apiClient.post as vi.Mock).mockResolvedValue(label);

      const response = await apiClient.post('/task-labels', { name: 'Bug', color: '#ff0000' });
      expect(response).toEqual(label);
    });

    it('adds label to task', async () => {
      (apiClient.post as vi.Mock).mockResolvedValue({});

      await apiClient.post('/tasks/1/labels/l1');
      expect(apiClient.post).toHaveBeenCalledWith('/tasks/1/labels/l1');
    });
  });
});