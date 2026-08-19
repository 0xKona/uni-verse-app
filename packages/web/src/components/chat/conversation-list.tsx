"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search, SearchX } from "lucide-react";
import { useChats } from "@/hooks/useChatQuery";
import { useUsers } from "@/hooks/useUserQuery";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { Input } from "@/components/ui/input";
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
  const [query, setQuery] = useState("");

  const participantIds = useMemo(
    () => chats.map((c) => c.participantId),
    [chats],
  );
  const { data: users = [], isLoading: usersLoading } =
    useUsers(participantIds);

  const usersById = useMemo(() => {
    const map = new Map<string, (typeof users)[number]>();
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

  // Client-side search filter by participant name
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) =>
      usersById.get(c.participantId)?.username.toLowerCase().includes(q),
    );
  }, [sorted, query, usersById]);

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
      <div className="relative mx-1 mb-0.5">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches found"
          description="No conversations match your search."
          className="py-8"
        />
      ) : (
        filtered.map((chat) => (
          <ConversationCard
            key={chat.chatId}
            chat={chat}
            onSelectChat={onSelectChat}
            isActive={chat.chatId === activeChatId}
          />
        ))
      )}
    </div>
  );
}