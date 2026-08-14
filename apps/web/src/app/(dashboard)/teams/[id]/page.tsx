'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Users, FileText, AlertTriangle, CheckCircle, TrendingUp, Clock, BarChart2, AlertCircle, UserCheck, FileChartColumn, Edit, Trash2, Plus, MessageCircle, Calendar, ArrowLeft, Save, X, Check, Share2, Download, Clock as ClockIcon, Build, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Team {
  id: string;
  name: string;
  description?: string;
  members: { user: { username: string; firstName?: string; lastName?: string }; role: string }[];
  projects: { id: string; name: string; _count: { tasks: number } }[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', params.id],
    queryFn: () => apiClient.get<any>(`/teams/${params.id}`),
    enabled: !!params.id,
  );

  const updateTeam = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/teams/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', params.id] });
      setIsEditing(false);
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => router.push('/teams'),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat team</div>;
  if (!team) return <div className="p-4">Team tidak ditemukan</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam.mutate(editForm);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/teams')}>Teams</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{team.name}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{team.name}</h1>
          <p className="text-on-surface-variant font-body-base mt-xs">{team.description}</p>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          {isEditing ? (
            <>
              <ActionButton icon={<Save className="h-4 w-4" />} onClick={() => updateTeam.mutate(editForm)}>Save</ActionButton>
              <ActionButton icon={<X className="h-4 w-4" />} variant="ghost" onClick={() => { setIsEditing(false); setEditForm({ name: team.name, description: team.description || '' }); }}>Cancel</ActionButton>
            </>
          )} : (
            <>
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => { setEditForm({ name: team.name, description: team.description || '' }); setIsEditing(true); }}>Edit</ActionButton>
              <ActionButton icon={<Trash2 className="h-4 w-4" />} variant="destructive" onClick={() => { if (confirm('Delete team?')) deleteTeam.mutate(team.id); }}>Delete</ActionButton>
              <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/teams')}>Back</ActionButton>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); updateTeam.mutate(editForm); }} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nama Tim</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
          </div>
        </form>
      )} : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">{team.name}</h1>
              <p className="font-body-base text-body-base text-on-surface-variant">{team.description}</p>
            </div>
            <div className="flex gap-sm">
              <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline" onClick={() => { setEditForm({ name: team.name, description: team.description || '' }); setIsEditing(true); }}>Edit Tim</ActionButton>
              <ActionButton icon={<Plus className="h-4 w-4" />}>Tambah Anggota</ActionButton>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* KPIs (Spans 8 cols on desktop) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display-md text-display-md text-on-surface mb-sm">142</div>
                  <div className="flex items-center font-metadata text-metadata text-primary">
                    <span className="material-symbols-outlined text-[16px] mr-xs">trending_up</span>
                    +12% vs last week
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display-md text-display-md text-on-surface mb-sm">38</div>
                  <div className="flex items-center font-metadata text-metadata text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] mr-xs">horizontal_rule</span>
                    Stabil
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display-md text-display-md text-error mb-sm">3</div>
                  <div className="flex items-center font-metadata text-metadata text-error">
                    <span className="material-symbols-outlined text-[16px] mr-xs">warning</span>
                    Perlu Perhatian
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">SLA Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-display-md text-display-md text-tertiary-container mb-sm">Tinggi</div>
                  <div className="flex items-center font-metadata text-metadata text-tertiary-container">
                    <span className="material-symbols-outlined text-[16px] mr-xs">timer_off</span>
                    2 Tasks berisiko
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Lead Info (Spans 4 cols on desktop) */}
            <Card className="md:col-span-4 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-md border-4 border-surface-container">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs80hTklWbS9zUlCDc1QcU3wsIxg8QSmR2NAywqhyPD97pgbzDxta8gsyJg_dx7DNrjMwDA9MVEz8QmC7B966Bh1uwUzsUvy2v7yUkulijIP1aloLzdVGBHvwL5vZ-SZ2WObJnGwXLX7x4NvUhoM18IQm5ISiVQBrOGm5ecpA0RD1velP01eZKTXnokjcRpbIJGkaf0Zavql70aZSt0x51ALf441JZS9yw33re7LsfNnyNkg5akXXZ" alt="Team Lead" />
              </div>
              <h3 className="font-section-title text-section-title font-semibold text-on-surface">Budi Santoso</h3>
              <p className="font-metadata text-metadata text-on-surface-variant mb-md">Team Lead, Engineering</p>
              <div className="flex gap-sm">
                <ActionButton icon={<MessageCircle className="h-4 w-4" />} variant="outline">Message</ActionButton>
                <ActionButton icon={<Share2 className="h-4 w-4" />} variant="outline">Call</ActionButton>
              </div>
            </Card>
          </div>

          {/* Main Content Area: Members & Workload (Spans 8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-gutter">
            {/* Member List Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Daftar Anggota</CardTitle>
                  <span className="font-metadata text-metadata text-on-surface-variant">12 Total</span>
                </CardHeader>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                    <thead className="bg-surface-container-low font-metadata text-metadata text-on-surface-variant uppercase tracking-wider">
                      <tr>
                        <th className="px-md py-sm border-b border-surface-variant font-medium">Nama</th>
                        <th className="px-md py-sm border-b border-surface-variant font-medium">Peran</th>
                        <th className="px-md py-sm border-b border-surface-variant font-medium text-center">Task Aktif</th>
                        <th className="px-md py-sm border-b border-surface-variant font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant">
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-md py-sm flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-bold text-xs">AS</div>
                          <span className="text-on-surface font-medium">Agus Setiawan</span>
                        </td>
                        <td className="px-md py-sm text-on-surface-variant">Senior Engineer</td>
                        <td className="px-md py-sm text-center text-on-surface">14</td>
                        <td className="px-md py-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-semibold">Aktif</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-md py-sm flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center font-bold text-xs">DW</div>
                          <span className="text-on-surface font-medium">Dewi Wijaya</span>
                        </td>
                        <td className="px-md py-sm text-on-surface-variant">QA Specialist</td>
                        <td className="px-md py-sm text-center text-on-surface">8</td>
                        <td className="px-md py-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-semibold">Aktif</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-md py-sm flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-error-container text-on-error-container flex items-center justify-center font-bold text-xs">RS</div>
                          <span className="text-on-surface font-medium">Rizky Siregar</span>
                        </td>
                        <td className="px-md py-sm text-on-surface-variant">DevOps Engineer</td>
                        <td className="px-md py-sm text-center text-on-surface">22</td>
                        <td className="px-md py-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-semibold">Sibuk</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Simple Workload Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Beban Kerja Tim (Minggu Ini)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-sm mt-md">
                    <div>
                      <div className="flex justify-between font-metadata text-metadata text-on-surface-variant mb-xs">
                        <span>Development</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-metadata text-metadata text-on-surface-variant mb-xs">
                        <span>Bug Fixing</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div className="bg-tertiary-container h-full rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-metadata text-metadata text-on-surface-variant mb-xs">
                        <span>Meetings & Admin</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content: Activity Timeline (Spans 4 cols) */}
            <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-center mb-md pb-sm border-b border-surface-variant">
                  <CardTitle>Activity Timeline</CardTitle>
                  <ActionButton icon={<Search className="h-4 w-4" />} variant="ghost" size="sm">Lihat Semua</ActionButton>
                </CardHeader>
              </CardHeader>
              <CardContent>
                <div className="flex-1 overflow-y-auto relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-outline-variant"></div>
                  <div className="space-y-md relative z-10">
                    <div className="flex gap-sm">
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 border-2 border-surface-container-lowest">
                        <span className="material-symbols-outlined text-[16px] text-on-secondary-fixed">check_circle</span>
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface"><strong>Agus Setiawan</strong> menyelesaikan Task <span className="text-primary cursor-pointer hover:underline">ENG-204</span></p>
                        <span className="font-metadata text-metadata text-on-surface-variant">2 jam yang lalu</span>
                      </div>
                    </div>
                    <div className="flex gap-sm">
                      <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center shrink-0 border-2 border-surface-container-lowest">
                        <span className="material-symbols-outlined text-[16px] text-on-error-container">report</span>
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface">Incident baru dilaporkan: <span className="font-medium text-error">Database Latency</span></p>
                        <span className="font-metadata text-metadata text-on-surface-variant">5 jam yang lalu</span>
                      </div>
                    </div>
                    <div className="flex gap-sm">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border-2 border-surface-container-lowest">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">comment</span>
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm text-on-surface"><strong>Budi Santoso</strong> menambahkan komentar pada Request <span className="text-primary cursor-pointer hover:underline">REQ-99</span></p>
                        <span className="font-metadata text-metadata text-on-surface-variant">Kemarin, 14:30</span>
                      </div>
                    </div>
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