'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  apiClient,
  onFriendRequestReceived,
  onFriendRequestUpdated,
  onFriendListUpdated,
} from '@/lib/api';
import { FRIENDS_QUERY_KEYS } from './useFriendsQuery';
import type { FriendRequest } from '@/types/friends';

/**
 * Feature flag for subscriptions. Set to true when you've implemented
 * the subscription resolvers in your AppSync backend.
 * Until then, subscriptions will fail silently.
 */
const SUBSCRIPTIONS_ENABLED = false;

// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION HOOKS - Real-time updates via WebSocket
// Automatically update cache when data changes on server
// Note: Requires resolver implementation in AppSync backend
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to incoming friend requests
 * Automatically updates pending requests cache when new request arrives
 * Disabled until backend resolvers are implemented
 */
export function useSubscribeFriendRequestReceived() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!SUBSCRIPTIONS_ENABLED) return;

    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendRequestReceived,
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          // New request received - add to pending requests cache
          const newRequest = data.data?.onFriendRequestReceived;
          if (newRequest) {
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.pending(), (old: FriendRequest[] | undefined) => [
              ...(old || []),
              newRequest,
            ]);
          }
        },
        error: (error: any) => {
          console.warn('Friend request subscription error:', error.message);
        },
      });

      unsubscribe = () => {
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.warn('Failed to subscribe to friend requests:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);
}

/**
 * Subscribe to friend request status updates
 * Updates pending/sent requests when requests are accepted/declined
 * Refetches friends list on acceptance
 * Disabled until backend resolvers are implemented
 */
export function useSubscribeFriendRequestUpdated() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!SUBSCRIPTIONS_ENABLED) return;

    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendRequestUpdated,
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          const updatedRequest = data.data?.onFriendRequestUpdated;
          if (updatedRequest) {
            // Remove from pending/sent requests since status changed
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.pending(), (old: FriendRequest[] | undefined) =>
              old?.filter((r) => r.senderId !== updatedRequest.senderId) || [],
            );
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.sent(), (old: FriendRequest[] | undefined) =>
              old?.filter((r) => r.recipientId !== updatedRequest.recipientId) || [],
            );

            // If accepted (status = 'ACCEPTED'), refetch friends list to include new friend
            if (updatedRequest.status === 'ACCEPTED') {
              queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
            }
          }
        },
        error: (error: any) => {
          console.warn('Friend request update subscription error:', error.message);
        },
      });

      unsubscribe = () => {
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.warn('Failed to subscribe to friend request updates:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);
}

/**
 * Subscribe to friends list changes (additions/removals)
 * Keeps friends list in sync when other users add/remove this user
 * Disabled until backend resolvers are implemented
 */
export function useSubscribeFriendListUpdated() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!SUBSCRIPTIONS_ENABLED) return;

    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendListUpdated,
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          const updatedFriend = data.data?.onFriendListUpdated;
          if (updatedFriend) {
            // Refetch entire friends list to stay in sync
            queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
          }
        },
        error: (error: any) => {
          console.warn('Friend list subscription error:', error.message);
        },
      });

      unsubscribe = () => {
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.warn('Failed to subscribe to friend list updates:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);
}

/**
 * Master subscription hook - enables all real-time updates
 * Call this once in your main dashboard or app layout
 * Example: useSubscribeFriendsRealtime() in root dashboard
 */
export function useSubscribeFriendsRealtime() {
  useSubscribeFriendRequestReceived();
  useSubscribeFriendRequestUpdated();
  useSubscribeFriendListUpdated();
}
