"use client";

import { useMemo } from "react";
import { useChats } from "@/hooks/useChatQuery";
import { useUsers } from "@/hooks/useUserQuery";
import { EmptyState } from "@/components/ui/empty-state";
import type { Chat } from "@/types/messaging";
import ConversationCard from "./conversation-card";

interface ConversationListProps {
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
}

export function ConversationList({
  activeChatId,
  onSelectChat,
}: ConversationListProps) {
  console.log({ activeChatId });
  const { data: chats = [], isLoading } = useChats();

  const participantIds = useMemo(
    () => chats.map((c) => c.participantId),
    [chats],
  );
  const { data: users = [], isLoading: usersLoading } =
    useUsers(participantIds);

  const userMap = useMemo(() => {
    const map = new Map<string, { username: string }>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Sort by most recent message
  const sorted = useMemo(
    () =>
      [...chats].sort((a, b) =>
        (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
      ),
    [chats],
  );

  if (isLoading || usersLoading) return <EmptyState message="Loading…" />;
  if (!sorted.length) return <EmptyState message="No conversations yet." />;

  return (
    <ul className="flex flex-col gap-0.5">
      {sorted.map((chat) => {
        console.log({ chat });
        const user = userMap.get(chat.participantId);
        const name = user?.username ?? chat.participantId;
        const isActive = chat.chatId === activeChatId;

        return (
          <ConversationCard
            key={JSON.stringify(chat)}
            chat={chat}
            onSelectChat={onSelectChat}
            isActive={isActive}
          />
        );
      })}
    </ul>
  );
}
