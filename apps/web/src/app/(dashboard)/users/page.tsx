'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge, ActionButton } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  status: string;
  role: { id: string; name: string };
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
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

  if (isLoading) return <LoadingState message="Memuat users..." />;
  if (error) return <ErrorState title="Data belum dapat dimuat" onRetry={() => {}} />;
  if (!users || users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users</h1>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah User</ActionButton>
        </div>
        <EmptyState icon={<Users className="h-12 w-12" />} title="Belum ada pengguna" description="Tambahkan user pertama ke workspace Anda." action={<ActionButton icon={<Plus className="h-4 w-4" />}>Tambah User</ActionButton>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah User</ActionButton>
      </div>
      <DataTable
        columns={columns}
        data={users || []}
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