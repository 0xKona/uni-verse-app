'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiClient,
  sendFriendRequestMutation,
  respondToFriendRequestMutation,
  cancelFriendRequestMutation,
  removeFriendMutation,
} from '@/lib/api';
import { FRIENDS_QUERY_KEYS } from './useFriendsQuery';

// ══════════════════════════════════════════════════════════════════════════════
// MUTATION HOOKS - Modify friend data on server
// Invalidate relevant cache after successful mutations to trigger refetch
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Send a friend request to another user
 * Invalidates sent requests cache after success
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      const res = await apiClient.graphql({
        query: sendFriendRequestMutation,
        variables: { recipientId },
      });
      return (res as any).data.sendFriendRequest;
    },
    onSuccess: () => {
      // Invalidate sent requests list to refetch updated data
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.sent() });
    },
  });
}

/**
 * Accept or decline a friend request
 * Invalidates pending requests and friends list caches
 */
export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, accept }: { senderId: string; accept: boolean }) => {
      const res = await apiClient.graphql({
        query: respondToFriendRequestMutation,
        variables: { senderId, accept },
      });
      return (res as any).data.respondToFriendRequest;
    },
    onSuccess: () => {
      // Update both pending requests and friends list
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.pending() });
      if (true) { // accept case - only refetch friends on acceptance
        queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
      }
    },
  });
}

/**
 * Cancel a sent friend request
 * Invalidates sent requests cache after success
 */
export function useCancelFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      await apiClient.graphql({
        query: cancelFriendRequestMutation,
        variables: { recipientId },
      });
    },
    onSuccess: () => {
      // Invalidate sent requests to refetch updated data
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.sent() });
    },
  });
}

/**
 * Remove a user from friends list
 * Invalidates friends list cache after success
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string) => {
      await apiClient.graphql({
        query: removeFriendMutation,
        variables: { friendId },
      });
    },
    onSuccess: () => {
      // Invalidate friends list to refetch updated data
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
    },
  });
}
