'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

interface SLA {
  id: string;
  name: string;
  responseTarget: number;
  resolutionTarget: number;
  warningThreshold: number;
}

export default function SlaPage() {
  const queryClient = useQueryClient();
  const { data: slas, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.SLA,
    queryFn: () => apiClient.get<any[]>('/sla'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sla/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SLA }),
  });

  const columns = [
    { key: 'name', label: 'Nama SLA' },
    { key: 'responseTarget', label: 'Response Target (menit)' },
    { key: 'resolutionTarget', label: 'Resolution Target (menit)' },
    { key: 'warningThreshold', label: 'Warning Threshold (menit)' },
  ];

  if (isLoading) return <LoadingState message="Memuat SLA..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;
  if (!slas || slas.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">SLA Monitoring</h1>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah SLA</ActionButton>
        </div>
        <EmptyState icon={<Clock className="h-12 w-12" />} title="Belum ada SLA" description="Tambahkan definisi SLA untuk memulai monitoring." action={<ActionButton icon={<Plus className="h-4 w-4" />}>Tambah SLA</ActionButton>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SLA Monitoring</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah SLA</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={slas || []}
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