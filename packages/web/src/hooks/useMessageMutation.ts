'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiClient, sendMessageMutation } from '@/lib/api';
import { MESSAGE_QUERY_KEYS } from './useMessagesQuery';
import { CHAT_QUERY_KEYS } from './useChatQuery';
import type { Message } from '@/types/messaging';
import type { Chat } from '@/types/messaging';

interface MessagePage {
  messages: Message[];
  nextToken: string | null;
}

interface SendMessageVars {
  chatId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'GIF' | 'FILE';
  attachments?: string[];
}

export function useSendMessage(currentUserId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: SendMessageVars) => {
      const res = await apiClient.graphql({
        query: sendMessageMutation,
        variables: vars,
      });
      return (res as any).data.sendMessage as Message;
    },

    // Optimistic update — show message immediately
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
        attachments: vars.attachments,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<InfiniteData<MessagePage>>(queryKey, (old) => {
        if (!old) {
          return {
            pages: [{ messages: [optimisticMsg], nextToken: null }],
            pageParams: [null],
          };
        }
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [
            { ...firstPage, messages: [optimisticMsg, ...firstPage.messages] },
            ...old.pages.slice(1),
          ],
        };
      });

      // Optimistically update chat list so sender doesn't see unread on own chat
      const now = new Date().toISOString();
      const preview = vars.type === 'TEXT' ? vars.content.slice(0, 100) : `[${vars.type}]`;
      qc.setQueryData<Chat[]>(CHAT_QUERY_KEYS.chats, (old) =>
        old?.map(c =>
          c.chatId === vars.chatId
            ? { ...c, lastMessage: preview, lastMessageAt: now, lastReadAt: now }
            : c
        ),
      );

      return { previous };
    },

    // On error, roll back
    onError: (_err, vars, context) => {
      if (context?.previous) {
        qc.setQueryData(MESSAGE_QUERY_KEYS.messages(vars.chatId), context.previous);
      }
    },

    // On success, replace optimistic message with real one and refresh chat list
    onSuccess: (data) => {
      qc.setQueryData<InfiniteData<MessagePage>>(
        MESSAGE_QUERY_KEYS.messages(data.chatId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m) =>
                m.messageId.startsWith('optimistic-') && m.content === data.content
                  ? data
                  : m
              ),
            })),
          };
        },
      );
      qc.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.chats });
    },
  });
}
