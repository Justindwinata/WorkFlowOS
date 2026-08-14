'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ActionButton } from '@/components/ui/action-button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: { id: string; name: string };
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: users, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: () => apiClient.get<User[]>('/users'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
  });

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'Nama Depan' },
    { key: 'lastName', label: 'Nama Belakang' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Tambah User
        </button>
      </div>
      <DataTable
        columns={columns}
        data={users || []}
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
