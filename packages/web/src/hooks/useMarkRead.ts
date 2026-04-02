'use client';

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { markChatRead } from '@/lib/api';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Chat } from '@/types/messaging';

/**
 * Returns a markRead callback that can be called on any user interaction.
 * Debounced — won't call the API more than once per 2 seconds per chat.
 */
export function useMarkRead(chatId: string | null) {
  const qc = useQueryClient();
  const lastMarked = useRef<number>(0);

  return useCallback(() => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastMarked.current < 2000) return;
    lastMarked.current = now;

    const ts = new Date().toISOString();

    // Optimistic — update cache immediately
    qc.setQueryData<Chat[]>(CHAT_QUERY_KEYS.chats, (old) =>
      old?.map(c => c.chatId === chatId ? { ...c, lastReadAt: ts } : c),
    );

    // Fire and forget
    markChatRead(chatId).catch(console.error);
  }, [chatId, qc]);
}
