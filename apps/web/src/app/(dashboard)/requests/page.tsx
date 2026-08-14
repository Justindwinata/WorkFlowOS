'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  requester: { username: string };
  approvals: { status: string; approver: { username: string } }[];
}

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: () => apiClient.get<any[]>('/requests'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/requests/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS }),
  });

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Judul' },
    { key: 'type', label: 'Tipe' },
    { key: 'requester', label: 'Requester' },
  ];

  if (isLoading) return <LoadingState message="Memuat requests..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;
  if (!requests || requests.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Requests</h1>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Request</ActionButton>
        </div>
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Belum ada request" description="Buat request pertama untuk memulai workflow internal." action={<ActionButton icon={<Plus className="h-4 w-4" />}>Buat Request</ActionButton>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Requests</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Request</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={requests || []}
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