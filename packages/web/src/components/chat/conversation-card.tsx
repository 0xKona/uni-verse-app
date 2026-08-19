"use client";

import { useUser } from "@/hooks/useUserQuery";
import {
  usePrefetchMessages,
  useCachedMessages,
} from "@/hooks/useMessagesQuery";
import {
  cn,
  countUnreadMessages,
  formatTimestamp,
  isUnread,
} from "@/lib/utils";
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
  const { data: cached } = useCachedMessages(chat.chatId);

  if (!user || isLoading) return null;

  const messages = cached?.pages.flatMap((p) => p.messages) ?? [];
  const unreadCount = countUnreadMessages(chat.lastReadAt, messages);
  const unread = isUnread(chat.lastReadAt ?? "", chat.lastMessageAt ?? "");

  return (
    <div
      onClick={() => onSelectChat(chat)}
      onMouseEnter={() => prefetchMessages(chat.chatId)}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <UserCard
        user={user}
        subtitle={formatTimestamp(chat.lastMessageAt as string)}
        className="flex-1 px-0 py-0 hover:bg-transparent"
        avatarClassName={cn(
          "transition-shadow duration-200",
          isActive &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      />
      {unreadCount != null ? (
        <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : (
        unread && (
          <span
            aria-label="Unread"
            className="h-2 w-2 shrink-0 rounded-full bg-primary"
          />
        )
      )}
    </div>
  );
}