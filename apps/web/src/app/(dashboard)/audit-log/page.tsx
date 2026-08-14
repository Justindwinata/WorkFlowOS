'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: { email: string; firstName?: string; lastName?: string };
  summary?: string;
  timestamp: string;
}

export default function AuditLogPage() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.AUDIT_LOGS,
    queryFn: () => apiClient.get<AuditLog[]>('/audit-log'),
  });

  const columns = [
    { key: 'action', label: 'Aksi' },
    { key: 'entity', label: 'Entitas' },
    { key: 'entityId', label: 'Entity ID' },
    { key: 'actor', label: 'Actor' },
    { key: 'summary', label: 'Ringkasan' },
    { key: 'timestamp', label: 'Waktu' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={logs || []}
        rowKey="id"
        actions={() => <span />}
      />
    </div>
  );
}