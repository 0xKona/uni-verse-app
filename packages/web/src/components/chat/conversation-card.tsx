"use client";

import { useUser } from "@/hooks/useUserQuery";
import { usePrefetchMessages } from "@/hooks/useMessagesQuery";
import { cn, formatTimestamp, isUnread } from "@/lib/utils";
import type { Chat } from "@/types/messaging";
import { UserCard } from "../ui/user-card";

interface ConversationCardProps {
  chat: Chat;
  onSelectChat: (chat: Chat) => void;
  isActive: boolean;
}

export default function ConversationCard({
  chat,
  onSelectChat,
  isActive,
}: ConversationCardProps) {
  const { data: user, isLoading } = useUser(chat.participantId);
  const prefetchMessages = usePrefetchMessages();

  if (!user || isLoading) return null;

  const unread = isUnread(chat.lastReadAt!, chat.lastMessageAt!);

  return (
    <div
      onClick={() => onSelectChat(chat)}
      onMouseEnter={() => prefetchMessages(chat.chatId)}
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors",
        isActive ? "bg-muted" : "hover:bg-muted/50",
      )}
    >
      <UserCard
        user={user}
        subtitle={formatTimestamp(chat.lastMessageAt as string)}
      />
      {unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
    </div>
  );
}
