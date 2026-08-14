'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/tabs';
import { Check, X } from 'lucide-react';

interface Approval {
  id: string;
  status: string;
  comment?: string;
  request: { title: string; requester: { username: string } };
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { data: approvals, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.APPROVALS,
    queryFn: () => apiClient.get<any[]>('/approvals/pending'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: string; comment?: string }) =>
      apiClient.patch(`/approvals/${id}`, { status, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
    },
  });

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
      <div className="space-y-4">
        {approvals?.map((approval: Approval) => (
          <div key={approval.id} className="bg-background border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Pending</span>
                <span className="text-muted-foreground text-sm">{approval.request.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{approval.request.requester.username} • {approval.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(approval.id)}
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </button>
              <button
                onClick={() => handleReject(approval.id)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}