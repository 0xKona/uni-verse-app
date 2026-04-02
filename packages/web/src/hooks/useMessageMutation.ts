'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { sendMessage as sendMessageApi, type MessagePage } from '@/lib/api';
import { MESSAGE_QUERY_KEYS } from './useMessagesQuery';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Message, Chat } from '@/types/messaging';

interface SendMessageVars {
  chatId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'GIF' | 'FILE';
  attachments?: string[];
  /** Local blob URLs for optimistic preview — not sent to server */
  _previewUrls?: string[];
}

export function useSendMessage(currentUserId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: SendMessageVars) => {
      const { _previewUrls, ...serverVars } = vars;
      return sendMessageApi(serverVars);
    },

    onMutate: async (vars) => {
      const queryKey = MESSAGE_QUERY_KEYS.messages(vars.chatId);
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<InfiniteData<MessagePage>>(queryKey);

      const optimisticMsg: Message = {
        chatId: vars.chatId,
        messageId: `optimistic-${Date.now()}`,
        senderId: currentUserId,
        recipientId: '',
        type: vars.type,
        content: vars.content,
        // Use preview URLs for display, fall back to actual attachments
        attachments: vars._previewUrls ?? vars.attachments,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<InfiniteData<MessagePage>>(queryKey, (old) => {
        if (!old) {
          return { pages: [{ messages: [optimisticMsg], nextToken: null }], pageParams: [null] };
        }
        return {
          ...old,
          pages: [
            { ...old.pages[0], messages: [optimisticMsg, ...old.pages[0].messages] },
            ...old.pages.slice(1),
          ],
        };
      });

      const now = new Date().toISOString();
      const preview = vars.type === 'TEXT' ? vars.content.slice(0, 100) : `[${vars.type}]`;
      qc.setQueryData<Chat[]>(CHAT_QUERY_KEYS.chats, (old) =>
        old?.map(c => c.chatId === vars.chatId
          ? { ...c, lastMessage: preview, lastMessageAt: now, lastReadAt: now }
          : c),
      );

      return { previous };
    },

    onError: (_err, vars, context) => {
      if (context?.previous) {
        qc.setQueryData(MESSAGE_QUERY_KEYS.messages(vars.chatId), context.previous);
      }
    },

    onSuccess: (data) => {
      if (data.attachments?.length) {
        // Refetch to get pre-signed URLs — don't clear cache, so optimistic preview stays until data arrives
        qc.refetchQueries({ queryKey: MESSAGE_QUERY_KEYS.messages(data.chatId) });
      } else {
        // Replace optimistic text message with real one
        qc.setQueryData<InfiniteData<MessagePage>>(
          MESSAGE_QUERY_KEYS.messages(data.chatId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) =>
                  m.messageId.startsWith('optimistic-') && m.content === data.content ? data : m
                ),
              })),
            };
          },
        );
      }
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}
