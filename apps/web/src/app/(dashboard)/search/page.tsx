'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge } from '@/components/ui/tabs';
import { Search, Users, AlertTriangle, FileText } from 'lucide-react';

interface SearchResult {
  users: any[];
  tasks: any[];
  requests: any[];
  incidents: any[];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => apiClient.get<SearchResult>('/search', { params: { q: debouncedQuery } }),
    enabled: debouncedQuery.length >= 2,
  });

  const results = data || { users: [], tasks: [], requests: [], incidents: [] };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Global Search</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari users, tasks, requests, incidents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {debouncedQuery.length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          Ketik minimal 2 karakter untuk memulai pencarian
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && <div className="p-4 text-destructive">Gagal mencari data</div>}

      {!isLoading && !error && debouncedQuery.length >= 2 && (
        <div className="space-y-6">
          {results.users.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Users ({results.users.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">{user.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.tasks.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Tasks ({results.tasks.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.tasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.project?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.requests.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Requests ({results.requests.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.requests.slice(0, 5).map((req: any) => (
                    <div key={req.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{req.title}</p>
                        <p className="text-sm text-muted-foreground">{req.type}</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.incidents.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Incidents ({results.incidents.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.incidents.slice(0, 5).map((inc: any) => (
                    <div key={inc.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{inc.title}</p>
                        <p className="text-sm text-muted-foreground">{inc.affectedService}</p>
                      </div>
                      <StatusBadge status={inc.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(results.users.length + results.tasks.length + results.requests.length + results.incidents.length) === 0 && (
            <div className="text-center py-12 text-muted-foreground">Tidak ada hasil untuk "{debouncedQuery}"</div>
          )}
        </div>
      )}
    </div>
  );
}