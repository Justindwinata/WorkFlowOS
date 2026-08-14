'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  severity: string;
  priority: string;
  status: string;
  assignee?: { username: string };
  affectedService?: string;
}

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { data: incidents, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.INCIDENTS,
    queryFn: () => apiClient.get<Incident[]>('/incidents'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/incidents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS }),
  });

  const columns = [
    { key: 'severity', label: 'Severity' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'title', label: 'Judul' },
    { key: 'affectedService', label: 'Service' },
    { key: 'assignee', label: 'Assignee' },
  ];

  if (isLoading) return <LoadingState message="Memuat incidents..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;
  if (!incidents || incidents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Incidents</h1>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Incident</ActionButton>
        </div>
        <EmptyState icon={<AlertTriangle className="h-12 w-12" />} title="Belum ada incident" description="Belum ada incident yang dilaporkan." action={<ActionButton icon={<Plus className="h-4 w-4" />}>Buat Incident</ActionButton>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Incident</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={incidents || []}
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