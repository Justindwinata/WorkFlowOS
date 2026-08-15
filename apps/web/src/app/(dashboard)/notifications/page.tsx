'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { Trash2, Check } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => apiClient.get<Notification[]>('/notifications'),
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.UNREAD_NOTIFICATION_COUNT });
    },
  });

  const columns = [
    { key: 'read', label: 'Status' },
    { key: 'title', label: 'Judul' },
    { key: 'message', label: 'Pesan' },
    { key: 'type', label: 'Tipe' },
    { key: 'createdAt', label: 'Waktu' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <ActionButton onClick={() => markAllRead.mutate()} variant="outline">
          Tandai semua dibaca
        </ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={notifications || []}
        rowKey="id"
        actions={() => <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" />}
      />
    </div>
  );
}