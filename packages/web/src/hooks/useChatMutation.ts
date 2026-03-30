'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, createChatMutation, markChatReadMutation } from '@/lib/api';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Chat } from '@/types/messaging';

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (participantId: string) => {
      const res = await apiClient.graphql({
        query: createChatMutation,
        variables: { participantId },
      });
      return (res as any).data.createChat as Chat;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}

export function useMarkChatRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (chatId: string) => {
      await apiClient.graphql({
        query: markChatReadMutation,
        variables: { chatId },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}
