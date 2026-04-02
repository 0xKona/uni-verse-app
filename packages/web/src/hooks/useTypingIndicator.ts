'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { apiClient, sendTypingIndicatorMutation, onTypingIndicator } from '@/lib/api';

/**
 * Sends typing indicator events (debounced).
 * Returns a callback to call on keypress.
 */
export function useSendTyping(chatId: string | null) {
  const lastSent = useRef(0);

  return useCallback(() => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastSent.current < 2000) return;
    lastSent.current = now;

    (apiClient.graphql({
      query: sendTypingIndicatorMutation,
      variables: { chatId },
    }) as Promise<any>).catch(console.error);
  }, [chatId]);
}

/**
 * Subscribes to typing indicators for a chat.
 * Returns the userId of whoever is currently typing, or null.
 * Auto-dismisses after 3 seconds of no events.
 */
export function useTypingIndicator(chatId: string | null, currentUserId: string) {
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chatId) return;

    let unsubscribe: (() => void) | null = null;

    try {
      const subscription = apiClient.graphql({
        query: onTypingIndicator,
        variables: { chatId },
      });

      (subscription as any).subscribe({
        next: (event: any) => {
          const data = event.data?.onTypingIndicator;
          if (!data || data.userId === currentUserId) return;

          setTypingUserId(data.userId);
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
        },
        error: (err: any) => console.error('[Subscription] Typing error:', err),
      });

      unsubscribe = () => (subscription as any).unsubscribe?.();
    } catch (err) {
      console.error('[Subscription] Failed to subscribe to typing:', err);
    }

    return () => {
      unsubscribe?.();
      clearTimeout(timeoutRef.current!);
      setTypingUserId(null);
    };
  }, [chatId, currentUserId]);

  return typingUserId;
}
