'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description?: string;
  members: { user: { username: string } }[];
  _count: { projects: number };
}

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const { data: teams, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TEAMS,
    queryFn: () => apiClient.get<Team[]>('/teams'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEAMS }),
  });

  const columns = [
    { key: 'name', label: 'Nama Tim' },
    { key: 'description', label: 'Deskripsi' },
    { key: 'members', label: 'Anggota' },
    { key: '_count', label: 'Projects' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  const teamsWithMembers: Array<Team & { membersCount: number }> = (teams || []).map((t: Team) => ({
    ...t,
    membersCount: Array.isArray(t.members) ? t.members.length : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams</h1>
        <ActionButton icon={<Plus className="h-4 w-4" />}>Buat Tim</ActionButton>
      </div>
      <DataTable
        columns={[{ ...columns[2], key: 'membersCount' }, ...columns.slice(0, 2), columns[3]]}
        data={teamsWithMembers}
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