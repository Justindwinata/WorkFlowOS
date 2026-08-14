'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  team: { name: string };
  _count: { tasks: number };
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: () => apiClient.get<Project[]>('/projects'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS }),
  });

  const columns = [
    { key: 'name', label: 'Project' },
    { key: 'description', label: 'Deskripsi' },
    { key: 'team', label: 'Tim' },
    { key: 'status', label: 'Status' },
    { key: '_count', label: 'Tasks' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Project</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={projects || []}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton icon={<Edit className="h-4 w-4" />} />
            <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive"
              onClick={() => deleteMutation.mutate(row.id)} />
          </div>
        )}
      />
    </div>
  );
}