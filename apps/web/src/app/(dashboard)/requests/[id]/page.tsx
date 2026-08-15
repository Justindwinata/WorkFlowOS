'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton, StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', params.id],
    queryFn: () => apiClient.get<any>(`/requests/${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat request</div>;
  if (!request) return <div className="p-4">Request tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground">{request.type}</p>
        </div>
        <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/requests')}>Back</ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Detail Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p>{request.description || 'Tidak ada deskripsi'}</p>
            <div className="flex gap-2">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Requester</span><p>{request.requester?.username}</p></div>
            <div><span className="text-sm text-muted-foreground">Type</span><p>{request.type}</p></div>
            <div><span className="text-sm text-muted-foreground">Created</span><p>{request.createdAt}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}