'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getFriendsQuery, getPendingRequestsQuery, getSentRequestsQuery } from '@/lib/api';
import type { FriendRequest } from '@/types/friends';

// Query key constants - used for cache management
export const FRIENDS_QUERY_KEYS = {
  all: ['friends'] as const,
  list: () => [...FRIENDS_QUERY_KEYS.all, 'list'] as const,
  pending: () => [...FRIENDS_QUERY_KEYS.all, 'pending'] as const,
  sent: () => [...FRIENDS_QUERY_KEYS.all, 'sent'] as const,
};

// ══════════════════════════════════════════════════════════════════════════════
// QUERY HOOKS - Fetch friend data from server
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch the current user's friends list
 * @returns friends list, loading state, error state, and refetch function
 */
export function useFriends() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.list(),
    queryFn: async () => {
      const res = await apiClient.graphql({ query: getFriendsQuery });
      return (res as any).data.getFriends as FriendRequest[];
    },
    // Reduce network requests - friends list changes less frequently
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch friend requests received by current user (pending approval)
 * @returns pending requests list, loading state, error state, and refetch function
 */
export function usePendingRequests() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.pending(),
    queryFn: async () => {
      const res = await apiClient.graphql({ query: getPendingRequestsQuery });
      return (res as any).data.getPendingRequests as FriendRequest[];
    },
  });
}

/**
 * Fetch friend requests sent by current user (awaiting response)
 * @returns sent requests list, loading state, error state, and refetch function
 */
export function useSentRequests() {
  return useQuery({
    queryKey: FRIENDS_QUERY_KEYS.sent(),
    queryFn: async () => {
      const res = await apiClient.graphql({ query: getSentRequestsQuery });
      return (res as any).data.getSentRequests as FriendRequest[];
    },
  });
}
