'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton } from '@/components/ui/action-button';
import { ArrowLeft, Edit, Plus } from 'lucide-react';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', params.id],
    queryFn: () => apiClient.get<any>(`/teams/${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat team</div>;
  if (!team) return <div className="p-4">Team tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.description}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline">Edit Tim</ActionButton>
          <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah Anggota</ActionButton>
          <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/teams')}>Back</ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Daftar Anggota</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.members?.map((m: any) => (
                <div key={m.user?.username} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{m.user?.username}</p>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">Belum ada anggota</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {team.projects?.map((p: any) => (
                <div key={p.id} className="border rounded-lg p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p._count?.tasks || 0} tasks</p>
                </div>
              )) || <p className="text-muted-foreground">Belum ada project</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}