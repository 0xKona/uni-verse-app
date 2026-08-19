'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      toast.success('Friend request sent.');
    },
    onError: () => {
      toast.error("Couldn't send friend request. Please try again.");
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ senderId, accept }: { senderId: string; accept: boolean }) =>
      respondToFriendRequest(senderId, accept),
    onSuccess: (_data, { accept }) => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.pending() });
      if (accept) {
        queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
        toast.success('Friend request accepted.');
      }
    },
    onError: () => {
      toast.error("Couldn't process that request. Please try again.");
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
    onError: () => {
      toast.error("Couldn't cancel that request. Please try again.");
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEYS.list() });
      toast.success('Friend removed.');
    },
    onError: () => {
      toast.error("Couldn't remove friend. Please try again.");
    },
  });
}
