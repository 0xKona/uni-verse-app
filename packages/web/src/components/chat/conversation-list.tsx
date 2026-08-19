"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { useChats } from "@/hooks/useChatQuery";
import { useUsers } from "@/hooks/useUserQuery";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
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
  const { data: chats = [], isLoading } = useChats();

  const participantIds = useMemo(
    () => chats.map((c) => c.participantId),
    [chats],
  );
  const { isLoading: usersLoading } = useUsers(participantIds);

  // Sort by most recent message
  const sorted = useMemo(
    () =>
      [...chats].sort((a, b) =>
        (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
      ),
    [chats],
  );

  if (isLoading || usersLoading) return <ListSkeleton />;
  if (!sorted.length)
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description="Start a chat with a friend to say hello."
        action={<AddFriendDialog asButton />}
      />
    );

  return (
    <div className="flex flex-col gap-0.5">
      {sorted.map((chat) => {
        const isActive = chat.chatId === activeChatId;
        return (
          <ConversationCard
            key={chat.chatId}
            chat={chat}
            onSelectChat={onSelectChat}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
}
