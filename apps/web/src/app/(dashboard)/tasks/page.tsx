'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, MessageCircle, Calendar, CheckSquare, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { name: string };
  creator: { username: string };
  assignments: { user: { username: string } }[];
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [filter, setFilter] = useState<'all' | 'mine' | 'overdue'>('all');

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: projectId ? ['tasks', projectId] : QUERY_KEYS.TASKS,
    queryFn: () => apiClient.get<Task[]>('/tasks', { params: projectId ? { projectId } : undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS }),
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    switch (filter) {
      case 'mine':
        return tasks.filter((t: Task) =>
          t.assignments.some((a) => a.user.username === 'current-user'),
        );
      case 'overdue':
        return tasks.filter(
          (t: Task) =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
        );
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Judul' },
    { key: 'project', label: 'Project' },
    { key: 'creator', label: 'Creator' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  if (isLoading) return <LoadingState message="Memuat tasks..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;
  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Task</ActionButton>
        </div>
        <EmptyState
          icon={<CheckSquare className="h-12 w-12" />}
          title="Belum ada task"
          description="Buat task pertama untuk memulai workflow."
          action={<ActionButton icon={<Plus className="h-4 w-4" />}>Buat Task</ActionButton>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'mine' | 'overdue')}
            className="border border-input bg-background px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Semua</option>
            <option value="mine">Tugas Saya</option>
            <option value="overdue">Terlambat</option>
          </select>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Task</ActionButton>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredTasks}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton icon={<MessageCircle className="h-4 w-4" />} />
            <ActionButton icon={<Edit className="h-4 w-4" />} />
            <ActionButton
              icon={<Trash2 className="h-4 w-4" />}
              variant="destructive"
              onClick={() => deleteMutation.mutate(row.id)}
            />
          </div>
        )}
      />
    </div>
  );
}