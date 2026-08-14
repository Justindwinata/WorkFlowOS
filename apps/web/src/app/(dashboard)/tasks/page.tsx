'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ActionButton } from '@/components/ui/action-button';
import { Plus, Edit, Trash2, MessageCircle, Calendar } from 'lucide-react';
import { useState } from 'react';
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
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TASKS,
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  });

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Judul' },
    { key: 'project', label: 'Project' },
    { key: 'creator', label: 'Creator' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Buat Task
        </button>
      </div>
      <DataTable
        columns={columns}
        data={tasks || []}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton icon={<MessageCircle className="h-4 w-4" />} />
            <ActionButton icon={<Edit className="h-4 w-4" />} />
            <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" />
          </div>
        )}
      />
    </div>
  );
}
