'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton, StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: incident, isLoading, error } = useQuery({
    queryKey: ['incident', params.id],
    queryFn: () => apiClient.get<any>(`/incidents/${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat incident</div>;
  if (!incident) return <div className="p-4">Incident tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{incident.title}</h1>
          <p className="text-muted-foreground">{incident.affectedService}</p>
        </div>
        <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/incidents')}>Back</ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Detail Incident</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p>{incident.description || 'Tidak ada deskripsi'}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={incident.status} />
              <PriorityBadge priority={incident.priority} />
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">{incident.severity}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Assignee</span><p>{incident.assignee?.username || 'Unassigned'}</p></div>
            <div><span className="text-sm text-muted-foreground">Created</span><p>{incident.createdAt}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}