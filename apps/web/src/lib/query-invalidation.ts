import { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './query-client';

export const invalidateRelatedQueries = {
  task: (queryClient: QueryClient, taskId: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK(taskId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
  },
  request: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
  },
  incident: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
  },
  approval: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVALS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
  },
} as const;