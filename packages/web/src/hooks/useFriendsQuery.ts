'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFriends, fetchPendingRequests, fetchSentRequests } from '@/lib/api';

// Query key constants - used for cache management
export const FRIENDS_QUERY_KEYS = {
  all: ['friends'] as const,
  list: () => [...FRIENDS_QUERY_KEYS.all, 'list'] as const,
  pending: () => [...FRIENDS_QUERY_KEYS.all, 'pending'] as const,
  sent: () => [...FRIENDS_QUERY_KEYS.all, 'sent'] as const,
};

export function useFriends() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.list(),
    queryFn: fetchFriends,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.pending(),
    queryFn: fetchPendingRequests,
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.sent(),
    queryFn: fetchSentRequests,
  });
}
