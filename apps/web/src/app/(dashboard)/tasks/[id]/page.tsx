'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Edit, Check, MessageCircle, Calendar, Trash2, Download, Share2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { name: string; id: string };
  creator: { username: string };
  assignments: { user: { username: string } }[];
  comments: { id: string; content: string; author: { username: string }; createdAt: string }[];
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', params.id],
    queryFn: () => apiClient.get<any>(`/tasks/${params.id}`),
    enabled: !!params.id,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', params.id] }),
  });

  const addComment = useMutation({
    mutationFn: (content: string) => apiClient.post(`/tasks/${params.id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', params.id] });
      setNewComment('');
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => router.push('/tasks'),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" /></div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat task</div>;
  if (!task) return <div className="p-4">Task tidak ditemukan</div>;

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: task.id, status });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-md mb-lg">
        <div>
          <div className="flex items-center gap-xs font-metadata text-metadata text-on-surface-variant mb-xs">
            <span className="hover:text-primary transition-colors cursor-pointer">Projects</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="hover:text-primary transition-colors cursor-pointer">{task.project?.name}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface">{task.id}</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface">{task.title}</h1>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          <ActionButton icon={<Edit className="h-4 w-4" />}>Edit</ActionButton>
          <ActionButton icon={<Download className="h-4 w-4" />} variant="outline">Export</ActionButton>
          <ActionButton icon={<Share2 className="h-4 w-4" />} variant="outline">Share</ActionButton>
          <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/tasks')}>Back</ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
        {/* Left Column: Primary Content (Span 8) */}
        <div className="xl:col-span-8 flex flex-col gap-md">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="subject">subject</span>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-body-base text-body-base text-on-surface-variant space-y-sm whitespace-pre-wrap">
                {task.description || 'Tidak ada deskripsi'}
              </div>
            </CardContent>
          </Card>

          {/* Subtasks Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-sm">
                <CardTitle className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-on-surface-variant" data-icon="checklist">checklist</span>
                  Subtasks
                </CardTitle>
                <span className="font-metadata text-metadata text-on-surface-variant bg-surface-container-high px-sm py-[2px] rounded-full">
                  {task.comments?.filter(c => c.content.startsWith('[SUBTASK]')).length || 0}/4 Completed
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-xs">
                  {/* Subtask items would go here */}
                  <p className="text-muted-foreground text-sm">Tidak ada subtask</p>
                </div>
              </CardContent>
            </Card>

          {/* Comments / Activity Tabs */}
          <Card>
            <CardHeader>
              <div className="border-b border-outline-variant px-md pt-sm flex gap-md">
                <button className="pb-sm border-b-2 border-primary font-button-label text-button-label text-primary px-xs">Comments</button>
                <button className="pb-sm border-b-2 border-transparent font-button-label text-button-label text-on-surface-variant hover:text-on-surface px-xs transition-colors">Activity</button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-md flex flex-col gap-md">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-sm">
                    <img alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src={comment.author?.avatar} />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-sm mb-xs">
                        <span className="font-button-label text-button-label text-on-surface">{comment.author?.username}</span>
                        <span className="font-metadata text-metadata text-on-surface-variant">{format(new Date(comment.createdAt), 'PPP p')}</span>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded-lg rounded-tl-none font-body-sm text-body-sm text-on-surface">
                        {comment.content}
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">Belum ada komentar</p>
                  )}
                  {/* Comment Input */}
                  <div className="mt-sm flex gap-sm items-start border-t border-outline-variant pt-md">
                    <img alt="Current User" className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src="/placeholder-avatar.png" />
                    <div className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg p-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <textarea
                        className="w-full bg-transparent border-none focus:ring-0 resize-none font-body-sm text-body-sm p-xs min-h-[60px]"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-between items-center mt-xs px-xs pb-xs">
                        <div className="flex gap-xs text-on-surface-variant">
                          <button className="p-xs hover:bg-surface-container-highest rounded transition-colors"><span className="material-symbols-outlined text-[18px]" data-icon="format_bold">format_bold</span></button>
                          <button className="p-xs hover:bg-surface-container-highest rounded transition-colors"><span className="material-symbols-outlined text-[18px]" data-icon="link">link</span></button>
                          <button className="p-xs hover:bg-surface-container-highest rounded transition-colors"><span className="material-symbols-outlined text-[18px]" data-icon="attach_file">attach_file</span></button>
                        </div>
                        <button
                          className="bg-primary-container text-on-primary-container font-button-label text-[13px] px-sm py-[4px] rounded hover:bg-primary transition-colors"
                          onClick={() => addComment.mutate(newComment)}
                          disabled={!newComment.trim() || addComment.isPending}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Metadata & Details (Span 4) */}
          <div className="xl:col-span-4 flex flex-col gap-md">
            {/* Core Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Status</span>
                  <StatusBadge status={task.status} />
                </div>
                {/* Priority */}
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Priority</span>
                  <PriorityBadge priority={task.priority} />
                </div>
                {/* Assignee */}
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/50 group cursor-pointer hover:bg-surface-container-low -mx-xs px-xs rounded transition-colors">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Assignee</span>
                  <div className="flex items-center gap-xs">
                    {task.assignments?.[0]?.user && (
                      <>
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[10px]">
                          {task.assignments[0].user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">
                          {task.assignments[0].user.username}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Team */}
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Team</span>
                  <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant" data-icon="groups">groups</span>
                    {task.project?.team?.name}
                  </span>
                </div>
                {/* Project */}
                <div className="flex justify-between items-center py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Project</span>
                  <a className="font-body-sm text-body-sm text-primary hover:underline flex items-center gap-xs" href={`/projects/${task.project?.id}`}>
                    <span className="material-symbols-outlined text-[16px]" data-icon="account_tree">account_tree</span>
                    {task.project?.name}
                  </a>
                </div>
                {/* Created */}
                <div className="flex justify-between items-center py-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Created</span>
                  <span className="font-body-sm text-body-sm text-on-surface">{task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '-'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Attachments Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-sm">
                  <span className="font-metadata text-metadata text-on-surface-variant uppercase tracking-wider">Attachments</span>
                  <button className="text-primary hover:bg-primary-fixed/50 p-xs rounded transition-colors" title="Add Attachment">
                    <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-xs">
                    <a className="flex items-center gap-sm p-xs border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container-low transition-all group" href="#">
                      <div className="w-8 h-8 bg-error-container text-on-error-container rounded flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]" data-icon="picture_as_pdf">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface truncate group-hover:text-primary transition-colors">auth_architecture_v2.pdf</p>
                        <p className="font-metadata text-[11px] text-on-surface-variant">2.4 MB • Uploaded yesterday</p>
                      </div>
                    </a>
                    <a className="flex items-center gap-sm p-xs border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container-low transition-all group" href="#">
                      <div className="w-8 h-8 bg-secondary-container text-on-secondary-container rounded flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]" data-icon="image">image</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-body-sm text-on-surface truncate group-hover:text-primary transition-colors">login_flow_diagram.png</p>
                        <p className="font-metadata text-[11px] text-on-surface-variant">856 KB • Uploaded Oct 24</p>
                      </div>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}