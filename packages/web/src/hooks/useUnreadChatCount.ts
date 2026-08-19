'use client';

import { useMemo } from 'react';
import { useChats } from './useChatQuery';
import { isUnread } from '@/lib/utils';

export function useUnreadChatCount() {
  const { data: chats = [] } = useChats();

  return useMemo(
    () =>
      chats.filter((chat) =>
        isUnread(chat.lastReadAt ?? '', chat.lastMessageAt ?? ''),
      ).length,
    [chats],
  );
}
