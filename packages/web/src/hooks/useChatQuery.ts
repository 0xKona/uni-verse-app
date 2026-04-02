'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchChats } from '@/lib/api';
import type { Chat } from '@/types/messaging';

export const CHAT_QUERY_KEYS = {
  chats: ['chats'] as const,
};

export function useChats() {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.chats,
    queryFn: fetchChats,
    staleTime: 30 * 1000,
  });
}
