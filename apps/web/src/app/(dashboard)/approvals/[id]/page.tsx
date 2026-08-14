'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Check, X, ArrowLeft, Save, X as XIcon, Edit, MessageCircle, Calendar, Trash2, Download, Share2, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Approval {
  id: string;
  status: string;
  comment?: string;
  request: { 
    id: string; 
    title: string; 
    description?: string; 
    type: string; 
    status: string; 
    priority: string;
    requester: { username: string; email: string };
    approvals: { id: string; status: string; comment?: string; approver: { username: string }; createdAt: string }[];
  };
}

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: approval, isLoading, error } = useQuery({
    queryKey: ['approval', params.id],
    queryFn: () => apiClient.get<any>(`/approvals/${params.id}`),
    enabled: !!params.id,
  });

  const updateApproval = useMutation({
    mutationFn: (data: { status: string; comment?: string }) => apiClient.patch(`/approvals/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval', params.id] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat approval</div>;
  if (!approval) return <div className="p-4">Approval tidak ditemukan</div>;

  const request = approval.request;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/approvals')}>Approvals</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{request.id}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{request.title}</h1>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          <ActionButton icon={<ArrowLeftIcon className="h-4 w-4" />} onClick={() => router.push('/approvals')}>Back</ActionButton>
        </div>
      </div>

      {/* Approval Header with SLA */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Main Content */}
        <div className="xl:col-span-8 flex flex-col gap-gutter">
          {/* Request Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
                <span>{request.type}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-outline"></span>
                <span>{request.type}</span>
              </div>
              <CardTitle>{request.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-y-md gap-x-sm mb-lg">
                <div>
                  <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Requester</div>
                  <div className="flex items-center gap-sm">
                    <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0">
                      {request.requester?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface">{request.requester?.username}</span>
                  </div>
                </div>
                <div>
                  <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Tanggal Pengajuan</div>
                  <div className="font-body-sm text-body-sm text-on-surface flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                    {request.createdAt ? format(new Date(request.createdAt), 'dd MMM yyyy') : '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Estimasi Nilai</div>
                  <div className="font-body-base text-body-base font-semibold text-on-surface">Rp 450.000.000</div>
                </div>
              </div>
              <div className="mb-md">
                <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Deskripsi</div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed bg-surface p-sm rounded border border-surface-variant">
                  {request.description || 'Tidak ada deskripsi'}
                </p>
              </div>
              <div>
                <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Analisis Dampak (Impact)</div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {request.impact || 'Tidak ada analisis dampak'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stage & SLA Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Approval Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-surface-variant space-y-md">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 bg-surface-container-lowest border-2 border-[#166534] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-[#166534]">check</span>
                  </div>
                  <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Stage 1 - Selesai</div>
                  <div className="font-body-sm text-body-sm font-semibold text-on-surface">Manager Review</div>
                  <div className="text-xs text-on-surface-variant mt-[2px]">Disetujui oleh Anita (24 Okt)</div>
                </div>
                {/* Step 2 (Active) */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 bg-primary-container border-2 border-primary-container rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-on-primary-container rounded-full animate-pulse"></div>
                  </div>
                  <div className="font-metadata text-metadata text-primary mb-xs">Stage 2 - Menunggu Anda</div>
                  <div className="font-body-sm text-body-sm font-semibold text-on-surface">Finance Review</div>
                </div>
                {/* Step 3 */}
                <div className="relative opacity-50">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 bg-surface-container-lowest border-2 border-outline-variant rounded-full flex items-center justify-center">
                  </div>
                  <div className="font-metadata text-metadata text-on-surface-variant mb-xs">Stage 3 - Pending</div>
                  <div className="font-body-sm text-body-sm font-semibold text-on-surface">Director Approval</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="font-metadata text-metadata text-on-surface-variant mb-[2px]">SLA Tersisa</div>
              <div className="font-body-base text-body-base font-semibold text-[#bc4800]">12 Jam 45 Menit</div>
            </div>
            <span className="material-symbols-outlined text-[24px] text-[#bc4800]">timer</span>
          </div>
        </div>

        {/* Approval History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface font-metadata text-metadata text-on-surface-variant uppercase tracking-wider">
                    <th className="p-sm font-medium border-b border-surface-variant w-1/4">Tahap</th>
                    <th className="p-sm font-medium border-b border-surface-variant w-1/4">Reviewer</th>
                    <th className="p-sm font-medium border-b border-surface-variant w-1/6">Status</th>
                    <th className="p-sm font-medium border-b border-surface-variant w-1/4">Catatan</th>
                    <th className="p-sm font-medium border-b border-surface-variant w-1/6">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface">
                  <tr className="hover:bg-surface transition-colors">
                    <td className="p-sm border-b border-surface-variant align-middle">Manager Review</td>
                    <td className="p-sm border-b border-surface-variant align-middle">Anita Wijaya</td>
                    <td className="p-sm border-b border-surface-variant align-middle">
                      <span className="inline-flex items-center px-2 py-[2px] rounded-xl text-[11px] font-medium bg-[#dcfce7] text-[#166534]">
                        Disetujui
                      </span>
                    </td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant italic">Anggaran tersedia di departemen.</td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant text-xs">24 Okt 2023, 10:30</td>
                  </tr>
                  <tr className="hover:bg-surface transition-colors">
                    <td className="p-sm border-b border-surface-variant align-middle">System Check</td>
                    <td className="p-sm border-b border-surface-variant align-middle">WorkFlowOS</td>
                    <td className="p-sm border-b border-surface-variant align-middle">
                      <span className="inline-flex items-center px-2 py-[2px] rounded-xl text-[11px] font-medium bg-[#dcfce7] text-[#166534]">
                        Valid
                      </span>
                    </td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant italic">Dokumen lengkap.</td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant text-xs">24 Okt 2023, 10:31</td>
                  </tr>
                  <tr className="hover:bg-surface transition-colors">
                    <td className="p-sm border-b border-surface-variant align-middle">Finance Review</td>
                    <td className="p-sm border-b border-surface-variant align-middle">Anda</td>
                    <td className="p-sm border-b border-surface-variant align-middle">
                      <span className="inline-flex items-center px-2 py-[2px] rounded-xl text-[11px] font-medium bg-[#fffbeb] text-[#92400e]">
                        Menunggu
                      </span>
                    </td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant italic">Menunggu persetujuan Anda</td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant text-xs">-</td>
                  </tr>
                  <tr className="hover:bg-surface transition-colors opacity-50">
                    <td className="p-sm border-b border-surface-variant align-middle">Director Approval</td>
                    <td className="p-sm border-b border-surface-variant align-middle">-</td>
                    <td className="p-sm border-b border-surface-variant align-middle">
                      <span className="inline-flex items-center px-2 py-[2px] rounded-xl text-[11px] font-medium bg-surface-container text-on-surface-variant">
                        Pending
                      </span>
                    </td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant italic">Menunggu Finance Review</td>
                    <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant text-xs">-</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Sticky Footer Actions */}
          <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface-container-lowest border-t border-surface-variant p-sm md:p-md z-[150] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-end gap-sm md:gap-md">
              <button className="w-full md:w-auto px-lg py-[10px] rounded border border-surface-variant bg-surface-container-lowest text-on-surface font-button-label text-button-label hover:bg-surface-container-low transition-colors text-center">
                Request Changes
              </button>
              <div className="flex items-center gap-sm w-full md:w-auto">
                <button className="flex-1 md:flex-none px-lg py-[10px] rounded border border-[#ef4444] bg-surface-container-lowest text-[#dc2626] font-button-label text-button-label hover:bg-[#fef2f2] transition-colors text-center">
                  Reject
                </button>
                <button className="flex-1 md:flex-none px-lg py-[10px] rounded bg-primary-container text-on-primary-container font-button-label text-button-label hover:opacity-90 transition-opacity text-center flex justify-center items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}