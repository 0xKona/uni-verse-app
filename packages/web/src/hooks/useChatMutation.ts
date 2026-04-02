'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChat as createChatApi, markChatRead } from '@/lib/api';
import { CHAT_QUERY_KEYS } from './useChatQuery';

export function useCreateChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) => createChatApi(participantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}

export function useMarkChatRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => markChatRead(chatId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}
