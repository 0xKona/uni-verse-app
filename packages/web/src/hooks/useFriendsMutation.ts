'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from '@/lib/api';
import { FRIENDS_QUERY_KEYS } from './useFriendsQuery';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => sendFriendRequest(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.sent() });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, accept }: { senderId: string; accept: boolean }) =>
      respondToFriendRequest(senderId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.pending() });
      if (true) { // accept case - only refetch friends on acceptance
        queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
      }
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => cancelFriendRequest(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.sent() });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
    },
  });
}
