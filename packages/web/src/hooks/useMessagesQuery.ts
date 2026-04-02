'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, type MessagePage } from '@/lib/api';

export const MESSAGE_QUERY_KEYS = {
  messages: (chatId: string) => ['messages', chatId] as const,
};

export type { MessagePage };

export function useMessages(chatId: string | null) {
  return useInfiniteQuery({
    queryKey: MESSAGE_QUERY_KEYS.messages(chatId ?? ''),
    queryFn: ({ pageParam }) => fetchMessages(chatId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken,
    enabled: !!chatId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function usePrefetchMessages() {
  const qc = useQueryClient();
  return (chatId: string) => {
    qc.prefetchInfiniteQuery({
      queryKey: MESSAGE_QUERY_KEYS.messages(chatId),
      queryFn: () => fetchMessages(chatId),
      initialPageParam: null,
      staleTime: 10 * 60 * 1000,
    });
  };
}
