'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Edit, Trash2, MessageCircle, Calendar, ArrowLeft, Save, X, Check, Share2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Request {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  requester: { username: string; email: string };
  approvals: { id: string; status: string; comment?: string; approver: { username: string } }[];
  createdAt: string;
  updatedAt: string;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', type: '', priority: '' });

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', params.id],
    queryFn: () => apiClient.get<any>(`/requests/${params.id}`),
    enabled: !!params.id,
  });

  const updateRequest = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/requests/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', params.id] });
      setIsEditing(false);
    },
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/requests/${id}`),
    onSuccess: () => router.push('/requests'),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat request</div>;
  if (!request) return <div className="p-4">Request tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/requests')}>Requests</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{request.id}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{request.title}</h1>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          {isEditing ? (
            <>
              <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => updateRequest.mutate(editForm)}>Save</ActionButton>
              <ActionButton icon={<X className="h-4 w-4" />} variant="ghost" onClick={() => { setIsEditing(false); setEditForm({ title: request.title, description: request.description || '', type: request.type, priority: request.priority }); }}>Cancel</ActionButton>
            </>
          )} : (
            <>
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => { setEditForm({ title: request.title, description: request.description || '', type: request.type, priority: request.priority }); setIsEditing(true); }}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete request?')) deleteRequest.mutate(request.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/requests')}>Back</ActionButton>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); updateRequest.mutate(editForm); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="it_access">IT Access Request</option>
                <option value="laptop">Laptop Request</option>
                <option value="software">Software Installation</option>
                <option value="procurement">Procurement Request</option>
                <option value="hr">HR Request</option>
                <option value="finance">Finance Request</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
          </div>
        </form>
      )} : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-xl">
            <div>
              <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/requests')}>Requests</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-on-surface">{request.id}</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface">{request.title}</h1>
            </div>
            <div className="flex items-center gap-sm shrink-0">
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => setIsEditing(true)}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete request?')) deleteRequest.mutate(request.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/requests')}>Back</ActionButton>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Center Canvas (Content) */}
            <div className="xl:col-span-8 flex flex-col gap-gutter">
              {/* Request Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="px-2 py-0.5 rounded-xl bg-error-container text-on-error-container font-metadata text-[10px] font-bold uppercase flex items-center gap-xs">
                      <span class="w-1.5 h-1.5 rounded-full bg-error"></span> Critical
                    </span>
                    <span class="px-2 py-0.5 rounded-xl border border-outline-variant text-on-surface-variant font-metadata text-[10px] font-bold uppercase">
                        P1
                    </span>
                  </div>
                  <h1 className="font-display-lg text-display-lg text-on-background mb-xs">{request.title}</h1>
                  <p className="font-body-base text-body-base text-on-surface-variant flex items-center gap-xs">
                    <span class="material-symbols-outlined text-[16px]">storage</span> {request.type}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-body-base text-body-base text-on-surface-variant space-y-sm whitespace-pre-wrap">
                    {request.description || 'Tidak ada deskripsi'}
                  </p>
                </CardContent>
              </Card>

              {/* Approval Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low font-metadata text-metadata text-on-surface-variant border-b border-surface-variant">
                        <tr>
                          <th className="py-sm px-md font-medium uppercase">Tahap</th>
                          <th className="py-sm px-md font-medium uppercase">Reviewer</th>
                          <th className="py-sm px-md font-medium uppercase">Status</th>
                          <th className="py-sm px-md font-medium uppercase">Catatan</th>
                          <th className="py-sm px-md font-medium uppercase">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-variant">
                        {request.approvals?.map((approval: any) => (
                          <tr key={approval.id} className="hover:bg-surface-bright transition-colors">
                            <td className="p-sm border-b border-surface-variant align-middle">{approval.stage || 'Stage 1'}</td>
                            <td className="p-sm border-b border-surface-variant align-middle">{approval.approver?.username}</td>
                            <td className="p-sm border-b border-surface-variant align-middle">
                              <span className="inline-flex items-center px-2 py-[2px] rounded-xl text-[11px] font-medium
                                {approval.status === 'approved' ? 'bg-[#dcfce7] text-[#166534]' :
                                  approval.status === 'rejected' ? 'bg-[#fef2f2] text-[#991b1b]' :
                                    'bg-[#fffbeb] text-[#92400e]'}">
                                {approval.status === 'approved' ? 'Disetujui' : approval.status === 'rejected' ? 'Ditolak' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant italic">{approval.comment || '-'}</td>
                            <td className="p-sm border-b border-surface-variant align-middle text-on-surface-variant text-xs">{approval.createdAt ? format(new Date(approval.createdAt), 'PPP p') : '-'}</td>
                          </tr>
                        ))}
                        {(!request.approvals || request.approvals.length === 0) && (
                          <tr>
                            <td colSpan={5} className="p-sm text-center text-muted-foreground">Belum ada approval</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons (if pending) */}
              {request.status === 'pending' && request.approvals?.some(a => a.status === 'pending') && (
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
                        <span class="material-symbols-outlined text-[18px]">check_circle</span>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Right Column: Metadata & Details (Span 4) */}
            <div className="xl:col-span-4 flex flex-col gap-gutter">
              {/* Status & SLA Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Status & SLA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Status</p>
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] animate-spin" style={{ animationDuration: '3s' }}>sync</span>
                      <span className="font-body-base text-body-base font-semibold text-on-surface">{request.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-sm flex items-center gap-xs">
                      <span class="material-symbols-outlined text-[14px]">timer</span> SLA Time to Resolve
                    </p>
                    <div className="bg-surface-bright border border-surface-variant rounded-lg p-md text-center">
                      <span className="font-display-md text-display-md font-bold text-error block mb-xs">42m 15s</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Remaining before breach</span>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-md overflow-hidden">
                        <div className="bg-error h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Requester</p>
                    <div className="flex items-center gap-sm">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">{request.requester?.username?.charAt(0).toUpperCase()}</div>
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">{request.requester?.username}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Type</p>
                    <span className="font-body-sm text-body-sm text-on-surface">{request.type}</span>
                  </div>
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Priority</p>
                    <PriorityBadge priority={request.priority} />
                  </div>
                  <div>
                    <p className="font-metadata text-metadata text-on-surface-variant mb-xs">Created</p>
                    <span className="font-body-sm text-body-sm text-on-surface">{request.createdAt ? format(new Date(request.createdAt), 'PPP p') : '-'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}