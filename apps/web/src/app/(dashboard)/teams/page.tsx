'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/query-client';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';

interface Team {
  id: string;
  name: string;
  description?: string;
  _count: { projects: number };
}

export default function TeamsPage() {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.TEAMS,
    queryFn: () => apiClient.get<Team[]>('/teams'),
  });

  const columns = [
    { key: 'name', label: 'Nama Tim' },
    { key: 'description', label: 'Deskripsi' },
    { key: '_count', label: 'Projects' },
  ];

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat data</div>;

  const teamsWithMembers = (teams || []).map((t) => ({ ...t, members: t._count.projects || 0 }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Buat Tim
        </button>
      </div>
      <DataTable
        columns={[...columns, { key: 'members', label: 'Anggota' }]}
        data={teamsWithMembers}
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
