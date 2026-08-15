'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton, StatusBadge } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => apiClient.get<any>(`/projects/${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat project</div>;
  if (!project) return <div className="p-4">Project tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.team?.name}</p>
        </div>
        <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/projects')}>Back</ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Detail Project</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p>{project.description || 'Tidak ada deskripsi'}</p>
            <StatusBadge status={project.status} />
            <div>
              <p className="text-sm font-medium">Tasks</p>
              <p>{project.tasks?.length || 0} tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Team</span><p>{project.team?.name}</p></div>
            <div><span className="text-sm text-muted-foreground">Workspace</span><p>{project.workspace?.name}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}