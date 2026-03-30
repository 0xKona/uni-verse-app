'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Separator } from '@/components/ui/separator';
import { AddFriendDialog } from '@/components/friends/add-friend-dialog';
import { FriendsList } from '@/components/friends/friends-list';
import { PendingRequests } from '@/components/friends/pending-requests';
import { SentRequests } from '@/components/friends/sent-requests';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateChat } from '@/hooks/useChatMutation';
import { useMessageSubscription } from '@/hooks/useMessageSubscription';
import { useMarkRead } from '@/hooks/useMarkRead';
import { useChats } from '@/hooks/useChatQuery';
import { useUsers } from '@/hooks/useUserQuery';
import type { Chat } from '@/types/messaging';

export default function DMPage() {
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const createChat = useCreateChat();
  const { data: chats = [] } = useChats();
  const markActive = useMarkRead(activeChat?.chatId ?? null);

  useEffect(() => {
    getCurrentUser().then(u => setCurrentUserId(u.username)).catch(console.error);
  }, []);

  // Subscribe to all incoming messages
  useMessageSubscription(currentUserId || null);

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat({ ...chat, lastReadAt: new Date().toISOString() });
    // markRead fires automatically via useMarkRead when the chat area gets focus/click
  }, []);

  const handleSelectFriend = useCallback(async (friendId: string) => {
    const existing = chats.find(c => c.participantId === friendId);
    if (existing) {
      setActiveChat({ ...existing, lastReadAt: new Date().toISOString() });
      return;
    }
    const chat = await createChat.mutateAsync(friendId);
    setActiveChat(chat);
  }, [chats, createChat]);

  // Resolve participant name for header
  const participantIds = activeChat ? [activeChat.participantId] : [];
  const { data: participants = [] } = useUsers(participantIds);
  const participantName = participants[0]?.username ?? activeChat?.participantId ?? '';

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <aside className="w-60 flex flex-col bg-muted/50 border-r border-border">
        <div className="px-3 pt-4 pb-2">
          <AddFriendDialog />
        </div>
        <Separator />
        <Tabs defaultValue="chats" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-3 mt-3 mb-1">
            <TabsTrigger value="chats" className="flex-1 text-xs">Chats</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 text-xs">Friends</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs">Pending</TabsTrigger>
            <TabsTrigger value="sent" className="flex-1 text-xs">Sent</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto px-1 pb-3">
            <TabsContent value="chats" className="mt-2">
              <ConversationList activeChatId={activeChat?.chatId ?? null} onSelectChat={handleSelectChat} />
            </TabsContent>
            <TabsContent value="friends" className="mt-2"><FriendsList onSelectFriend={handleSelectFriend} /></TabsContent>
            <TabsContent value="pending" className="mt-2"><PendingRequests /></TabsContent>
            <TabsContent value="sent" className="mt-2"><SentRequests /></TabsContent>
          </div>
        </Tabs>
      </aside>

      {/* Right panel — conversation */}
      {activeChat ? (
        <main className="flex flex-1 flex-col overflow-hidden" onClick={markActive} onKeyDown={markActive} onFocus={markActive}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <span className="text-sm font-medium">{participantName}</span>
            {activeChat.archived && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Read-only</span>
            )}
          </div>

          <MessageList chatId={activeChat.chatId} currentUserId={currentUserId} />
          <MessageInput chatId={activeChat.chatId} currentUserId={currentUserId} disabled={activeChat.archived ?? false} />
        </main>
      ) : (
        <main className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Select a conversation to start messaging
        </main>
      )}
    </div>
  );
}
