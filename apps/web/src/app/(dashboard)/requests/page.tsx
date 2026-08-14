'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ActionButton } from '@/components/ui/action-button';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
  const { data: requests, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.REQUESTS,
    queryFn: () => apiClient.get<Request[]>('/requests'),
  });

  const columns = [
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Judul' },
    { key: 'type', label: 'Tipe' },
    { key: 'requester', label: 'Requester' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Requests</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Buat Request
        </button>
      </div>
      <DataTable
        columns={columns}
        data={requests || []}
        rowKey="id"
        actions={(row) => (
          <div className="flex justify-center gap-1">
            <ActionButton icon={<Edit className="h-4 w-4" />} />
            <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" />
          </div>
        )}
      />
    </div>
  );
}
