'use client';

import { useEffect } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiClient, onMessageReceived } from '@/lib/api';
import { MESSAGE_QUERY_KEYS } from './useMessagesQuery';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Message } from '@/types/messaging';

interface MessagePage {
  messages: Message[];
  nextToken: string | null;
}

/**
 * Subscribes to all incoming messages for the current user.
 * Ignores messages sent by the current user (already handled optimistically).
 */
export function useMessageSubscription(userId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    let unsubscribe: (() => void) | null = null;

    try {
      console.log('[Subscription] Setting up onMessageReceived for user:', userId);
      const subscription = apiClient.graphql({
        query: onMessageReceived,
        variables: { recipientId: userId },
      });

      (subscription as any).subscribe({
        next: (event: any) => {
          console.log('[Subscription] Message received raw:', JSON.stringify(event));
          const msg: Message | undefined = event.data?.onMessageReceived;
          if (!msg) {
            console.log('[Subscription] No message in event');
            return;
          }

          console.log('[Subscription] Message from:', msg.senderId, 'current user:', userId);

          // Ignore own messages — already shown via optimistic update
          if (msg.senderId === userId) {
            console.log('[Subscription] Ignoring own message');
            return;
          }

          // Append to the message cache for this chat
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

          // Refresh chat list for updated previews
          qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
        },
        error: (err: any) => console.error('[Subscription] Message error:', err),
      });

      unsubscribe = () => {
        (subscription as any).unsubscribe?.();
      };
    } catch (err) {
      console.error('[Subscription] Failed to subscribe to messages:', err);
    }

    return () => {
      unsubscribe?.();
    };
  }, [userId, qc]);
}
