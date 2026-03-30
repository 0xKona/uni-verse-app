'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, getMessagesQuery } from '@/lib/api';
import type { Message } from '@/types/messaging';

export const MESSAGE_QUERY_KEYS = {
  messages: (chatId: string) => ['messages', chatId] as const,
};

interface MessagePage {
  messages: Message[];
  nextToken: string | null;
}

export function useMessages(chatId: string | null) {
  return useInfiniteQuery({
    queryKey: MESSAGE_QUERY_KEYS.messages(chatId ?? ''),
    queryFn: async ({ pageParam }) => {
      const res = await apiClient.graphql({
        query: getMessagesQuery,
        variables: { chatId, nextToken: pageParam ?? null },
      });
      return (res as any).data.getMessages as MessagePage;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken,
    enabled: !!chatId,
  });
}
