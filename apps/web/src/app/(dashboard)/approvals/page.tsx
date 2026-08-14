'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePendingApprovals, useUpdateApproval } from '@/lib/query-hooks';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface Approval {
  id: string;
  status: string;
  comment?: string;
  request: { title: string; requester: { username: string } };
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: approvals, isLoading, error } = usePendingApprovals();
  const updateMutation = useUpdateApproval();

  const columns = [
    { key: 'request', label: 'Request' },
    { key: 'request.requester', label: 'Requester' },
    { key: 'status', label: 'Status' },
    { key: 'comment', label: 'Catatan' },
  ];

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, status: 'approved', comment: 'Approved' });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, status: 'rejected', comment: 'Rejected' });
  };

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pending Approvals ({approvals?.length || 0})</h1>
      </div>
      <DataTable
        columns={columns}
        data={approvals || []}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton
              icon={<Check className="h-4 w-4" />}
              variant="default"
              onClick={() => handleApprove(row.id)}
            />
            <ActionButton
              icon={<X className="h-4 w-4" />}
              variant="destructive"
              onClick={() => handleReject(row.id)}
            />
          </div>
        )}
      />
    </div>
  );
}
