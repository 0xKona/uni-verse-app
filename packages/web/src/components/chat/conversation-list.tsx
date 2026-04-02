'use client';

import { useMemo } from 'react';
import { useChats } from '@/hooks/useChatQuery';
import { useUsers } from '@/hooks/useUserQuery';
import { MESSAGE_QUERY_KEYS } from '@/hooks/useMessagesQuery';
import { fetchMessages } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/messaging';

interface ConversationListProps {
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
}

export function ConversationList({ activeChatId, onSelectChat }: ConversationListProps) {
  const { data: chats = [], isLoading } = useChats();
  const qc = useQueryClient();

  const participantIds = useMemo(
    () => chats.map(c => c.participantId),
    [chats],
  );
  const { data: users = [] } = useUsers(participantIds);

  const userMap = useMemo(() => {
    const map = new Map<string, { username: string }>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  // Sort by most recent message
  const sorted = useMemo(
    () => [...chats].sort((a, b) =>
      (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '')
    ),
    [chats],
  );

  if (isLoading) return <EmptyState message="Loading…" />;
  if (!sorted.length) return <EmptyState message="No conversations yet." />;

  return (
    <ul className="flex flex-col gap-0.5">
      {sorted.map(chat => {
        const user = userMap.get(chat.participantId);
        const name = user?.username ?? chat.participantId;
        const initials = name[0]?.toUpperCase() ?? '?';
        const isActive = chat.chatId === activeChatId;
        const isUnread = chat.lastMessageAt && chat.lastReadAt && chat.lastMessageAt > chat.lastReadAt;

        return (
          <li
            key={chat.chatId}
            onClick={() => onSelectChat(chat)}
            onMouseEnter={() => {
              // Prefetch messages on hover so they're ready when clicked
              qc.prefetchInfiniteQuery({
                queryKey: MESSAGE_QUERY_KEYS.messages(chat.chatId),
                queryFn: () => fetchMessages(chat.chatId),
                initialPageParam: null,
                staleTime: 10 * 60 * 1000,
              });
            }}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors',
              isActive ? 'bg-muted' : 'hover:bg-muted/50',
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className={cn('text-sm truncate', isUnread && 'font-semibold')}>{name}</span>
              {chat.lastMessage && (
                <span className={cn(
                  'text-xs truncate',
                  isUnread ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {chat.lastMessage}
                </span>
              )}
            </div>
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
