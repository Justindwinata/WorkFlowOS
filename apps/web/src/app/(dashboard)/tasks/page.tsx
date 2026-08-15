'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, MessageCircle, Calendar, CheckSquare } from 'lucide-react';
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

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: projectId ? ['tasks', projectId] : QUERY_KEYS.TASKS,
    queryFn: () => apiClient.get<Task[]>('/tasks', { params: projectId ? { projectId } : undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS }),
  });

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
        <EmptyState icon={<CheckSquare className="h-12 w-12" />} title="Belum ada task" description="Buat task pertama untuk memulai workflow." action={<ActionButton icon={<Plus className="h-4 w-4" />}>Buat Task</ActionButton>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Task</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={tasks || []}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton icon={<MessageCircle className="h-4 w-4" />} />
            <ActionButton icon={<Edit className="h-4 w-4" />} />
            <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive"
              onClick={() => deleteMutation.mutate(row.id)} />
          </div>
        )}
      />
    </div>
  );
}