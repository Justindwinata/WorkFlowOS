'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionButton, StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { ArrowLeft, Check, X } from 'lucide-react';

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: approval, isLoading, error } = useQuery({
    queryKey: ['approval', params.id],
    queryFn: () => apiClient.get<any>(`/approvals/${params.id}`),
    enabled: !!params.id,
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat approval</div>;
  if (!approval) return <div className="p-4">Approval tidak ditemukan</div>;

  const request = approval.request;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground">{request.type}</p>
        </div>
        <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/approvals')}>Back</ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Informasi Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Requester</p>
              <p>{request.requester?.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p>{request.description || 'Tidak ada deskripsi'}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aksi Approval</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ActionButton icon={<Check className="h-4 w-4" />} className="w-full">Approve</ActionButton>
            <ActionButton icon={<X className="h-4 w-4" />} variant="destructive" className="w-full">Reject</ActionButton>
            <ActionButton variant="outline" className="w-full">Request Changes</ActionButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}