'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiClient, onMessageReceived } from '@/lib/api';
import { MESSAGE_QUERY_KEYS, type MessagePage } from './useMessagesQuery';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Message } from '@/types/messaging';

/**
 * Subscribes to all incoming messages for the current user.
 * Auto-reconnects on window focus and network recovery.
 */
export function useMessageSubscription(userId: string | null) {
  const qc = useQueryClient();
  const unsubRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback(() => {
    // Tear down existing
    unsubRef.current?.();
    unsubRef.current = null;

    if (!userId) return;

    try {
      console.log('[Subscription] Setting up onMessageReceived for user:', userId);
      const subscription = apiClient.graphql({
        query: onMessageReceived,
        variables: { recipientId: userId },
      });

      (subscription as any).subscribe({
        next: (event: any) => {
          const msg: Message | undefined = event.data?.onMessageReceived;
          if (!msg || msg.senderId === userId) return;

          qc.setQueryData<InfiniteData<MessagePage>>(
            MESSAGE_QUERY_KEYS.messages(msg.chatId),
            (old) => {
              if (!old) return old;
              const firstPage = old.pages[0];
              if (!firstPage) return old;
              if (firstPage.messages.some(m => m.messageId === msg.messageId)) return old;
              return {
                ...old,
                pages: [
                  { ...firstPage, messages: [msg, ...firstPage.messages] },
                  ...old.pages.slice(1),
                ],
              };
            },
          );

          qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
        },
        error: (err: any) => {
          console.error('[Subscription] Message error, will reconnect on focus:', err);
        },
      });

      unsubRef.current = () => (subscription as any).unsubscribe?.();
    } catch (err) {
      console.error('[Subscription] Failed to subscribe:', err);
    }
  }, [userId, qc]);

  // Initial subscribe
  useEffect(() => {
    subscribe();
    return () => unsubRef.current?.();
  }, [subscribe]);

  // Reconnect on window focus and network recovery
  useEffect(() => {
    const handleReconnect = () => {
      console.log('[Subscription] Reconnecting...');
      subscribe();
      // Also refetch stale data we may have missed
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    };

    window.addEventListener('focus', handleReconnect);
    window.addEventListener('online', handleReconnect);

    return () => {
      window.removeEventListener('focus', handleReconnect);
      window.removeEventListener('online', handleReconnect);
    };
  }, [subscribe, qc]);
}
