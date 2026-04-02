'use client';

import { useState, useCallback } from 'react';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { useCreateChat } from '@/hooks/useChatMutation';
import { useMessageSubscription } from '@/hooks/useMessageSubscription';
import { DMSidebar } from '@/components/chat/dm-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import type { Chat } from '@/types/messaging';

export default function DMPage() {
  const currentUserId = useCurrentUserId();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const createChat = useCreateChat();

  useMessageSubscription(currentUserId || null);

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat({ ...chat, lastReadAt: new Date().toISOString() });
  }, []);

  const handleSelectFriend = useCallback(async (friendId: string) => {
    const chat = await createChat.mutateAsync(friendId);
    setActiveChat({ ...chat, lastReadAt: new Date().toISOString() });
  }, [createChat]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <DMSidebar
        activeChatId={activeChat?.chatId ?? null}
        onSelectChat={handleSelectChat}
        onSelectFriend={handleSelectFriend}
      />

      {activeChat ? (
        <ChatPanel chat={activeChat} currentUserId={currentUserId} />
      ) : (
        <main className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Select a conversation to start messaging
        </main>
      )}
    </div>
  );
}
