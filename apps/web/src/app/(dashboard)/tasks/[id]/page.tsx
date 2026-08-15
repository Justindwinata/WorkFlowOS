'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, ActionButton } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Edit, MessageCircle, Download, Share2, ArrowLeft, Trash2 } from 'lucide-react';

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

  const addComment = useMutation({
    mutationFn: (content: string) => apiClient.post(`/tasks/${params.id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', params.id] });
      setNewComment('');
    },
  });

  if (isLoading) return <div className="p-4">Memuat...</div>;
  if (error) return <div className="p-4 text-destructive">Gagal memuat task</div>;
  if (!task) return <div className="p-4">Task tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground">{task.project?.name}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton icon={<Edit className="h-4 w-4" />} variant="outline">Edit</ActionButton>
          <ActionButton icon={<Download className="h-4 w-4" />} variant="outline">Export</ActionButton>
          <ActionButton icon={<Share2 className="h-4 w-4" />} variant="outline">Share</ActionButton>
          <ActionButton icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.push('/tasks')}>Back</ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p>{task.description || 'Tidak ada deskripsi'}</p>
            <div className="flex gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <div>
              <h3 className="font-medium mb-2">Comments</h3>
              <div className="space-y-3 mb-4">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{comment.author?.username}</span>
                      <span>{format(new Date(comment.createdAt), 'PPP p')}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                )) || <p className="text-muted-foreground">Belum ada komentar</p>}
              </div>
              <div className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-lg border px-3 py-2"
                  rows={3}
                />
                <ActionButton onClick={() => addComment.mutate(newComment)} disabled={!newComment.trim()}>Comment</ActionButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Assignee</span><p>{task.assignments?.[0]?.user?.username || 'Unassigned'}</p></div>
            <div><span className="text-sm text-muted-foreground">Creator</span><p>{task.creator?.username}</p></div>
            <div><span className="text-sm text-muted-foreground">Due Date</span><p>{task.dueDate ? format(new Date(task.dueDate), 'PPP') : '-'}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}