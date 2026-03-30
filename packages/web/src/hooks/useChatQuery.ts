'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, getChatsQuery } from '@/lib/api';
import type { Chat } from '@/types/messaging';

export const CHAT_QUERY_KEYS = {
  chats: ['chats'] as const,
};

export function useChats() {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.chats,
    queryFn: async () => {
      const res = await apiClient.graphql({ query: getChatsQuery });
      return (res as any).data.getChats as Chat[];
    },
    staleTime: 30 * 1000,
  });
}
