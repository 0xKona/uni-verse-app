'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUserId } from './useCurrentUserId';
import {
  apiClient,
  onFriendRequestReceived,
  onFriendRequestUpdated,
  onFriendListUpdated,
} from '@/lib/api';
import { FRIENDS_QUERY_KEYS } from './useFriendsQuery';
import type { FriendRequest } from '@/types/friends';

// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION HOOKS - Real-time updates via WebSocket
// Automatically update cache when data changes on server
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to incoming friend requests
 * Automatically updates pending requests cache when new request arrives
 */
export function useSubscribeFriendRequestReceived(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('[Subscription] Setting up onFriendRequestReceived for user:', userId);
    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendRequestReceived,
        variables: { recipientId: userId },
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          console.log('[Subscription] Friend request received:', data);
          // New request received - add to pending requests cache
          const newRequest = data.data?.onFriendRequestReceived;
          if (newRequest) {
            console.log('[Subscription] Adding new request to cache:', newRequest);
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.pending(), (old: FriendRequest[] | undefined) => {
              const exists = old?.some(r => r.senderId === newRequest.senderId);
              return exists ? old : [...(old || []), newRequest];
            });
          }
        },
        error: (error: any) => {
          console.error('[Subscription] Friend request subscription error:', error);
          console.error('[Subscription] Error details:', JSON.stringify(error, null, 2));
        },
      });

      unsubscribe = () => {
        console.log('[Subscription] Unsubscribing from onFriendRequestReceived');
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.error('[Subscription] Failed to subscribe to friend requests:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient, userId]);
}

/**
 * Subscribe to friend request status updates
 * Updates pending/sent requests when requests are accepted/declined
 * Updates friends list on acceptance
 */
export function useSubscribeFriendRequestUpdated(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('[Subscription] Setting up onFriendRequestUpdated for user:', userId);
    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendRequestUpdated,
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          console.log('[Subscription] Friend request updated:', data);
          const updatedRequest = data.data?.onFriendRequestUpdated;
          if (!updatedRequest) return;
          // Client-side filter: only process events relevant to this user
          if (updatedRequest.senderId !== userId && updatedRequest.recipientId !== userId) return;

          // If accepted, add to friends list
          if (updatedRequest.status === 'ACCEPTED') {
            console.log('[Subscription] Adding to friends list');
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.list(), (old: FriendRequest[] | undefined) => {
              const exists = old?.some(
                f => (f.senderId === updatedRequest.senderId && f.recipientId === updatedRequest.recipientId) ||
                     (f.senderId === updatedRequest.recipientId && f.recipientId === updatedRequest.senderId)
              );
              return exists ? old : [...(old || []), updatedRequest];
            });
          }

          // Remove from pending requests if current user is the recipient
          if (updatedRequest.recipientId === userId) {
            console.log('[Subscription] Removing from pending requests');
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.pending(), (old: FriendRequest[] | undefined) =>
              old?.filter((r) => r.senderId !== updatedRequest.senderId) || [],
            );
          }

          // Remove from sent requests if current user is the sender
          if (updatedRequest.senderId === userId) {
            console.log('[Subscription] Removing from sent requests');
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.sent(), (old: FriendRequest[] | undefined) =>
              old?.filter((r) => r.recipientId !== updatedRequest.recipientId) || [],
            );
          }
        },
        error: (error: any) => {
          console.error('[Subscription] Friend request update subscription error:', error);
          console.error('[Subscription] Error details:', JSON.stringify(error, null, 2));
        },
      });

      unsubscribe = () => {
        console.log('[Subscription] Unsubscribing from onFriendRequestUpdated');
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.error('[Subscription] Failed to subscribe to friend request updates:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient, userId]);
}

/**
 * Subscribe to friends list changes (additions/removals)
 * Keeps friends list in sync when friends are added or removed
 */
export function useSubscribeFriendListUpdated(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('[Subscription] Setting up onFriendListUpdated for user:', userId);
    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onFriendListUpdated,
      });

      (subscription as any).subscribe({
        next: (data: any) => {
          console.log('[Subscription] Friend list updated:', data);
          const update = data.data?.onFriendListUpdated;
          if (!update) return;
          // Client-side filter: only process events relevant to this user
          if (update.senderId !== userId && update.recipientId !== userId) return;

          if (update.status === 'ACCEPTED') {
            console.log('[Subscription] Adding friend to list');
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.list(), (old: FriendRequest[] | undefined) => {
              const exists = old?.some(
                f => (f.senderId === update.senderId && f.recipientId === update.recipientId) ||
                     (f.senderId === update.recipientId && f.recipientId === update.senderId)
              );
              return exists ? old : [...(old || []), update];
            });
          } else {
            console.log('[Subscription] Removing friend from list');
            queryClient.setQueryData(FRIENDS_QUERY_KEYS.list(), (old: FriendRequest[] | undefined) =>
              old?.filter(
                f => !((f.senderId === update.senderId && f.recipientId === update.recipientId) ||
                       (f.senderId === update.recipientId && f.recipientId === update.senderId))
              ) || [],
            );
          }
        },
        error: (error: any) => {
          console.error('[Subscription] Friend list subscription error:', error);
          console.error('[Subscription] Error details:', JSON.stringify(error, null, 2));
        },
      });

      unsubscribe = () => {
        console.log('[Subscription] Unsubscribing from onFriendListUpdated');
        (subscription as any).unsubscribe?.();
      };
    } catch (error) {
      console.error('[Subscription] Failed to subscribe to friend list updates:', error);
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient, userId]);
}

/**
 * Master subscription hook - enables all real-time updates
 * Call this once in your main dashboard or app layout
 * Example: useSubscribeFriendsRealtime() in root dashboard
 */
export function useSubscribeFriendsRealtime() {
  const userId = useCurrentUserId() || null;

  // Enable all subscriptions with the user ID
  useSubscribeFriendRequestReceived(userId);
  useSubscribeFriendRequestUpdated(userId);
  useSubscribeFriendListUpdated(userId);
}
