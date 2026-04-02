'use client';

import { Separator } from '@/components/ui/separator';
import { AddFriendDialog } from '@/components/friends/add-friend-dialog';
import { FriendsList } from '@/components/friends/friends-list';
import { PendingRequests } from '@/components/friends/pending-requests';
import { SentRequests } from '@/components/friends/sent-requests';
import { ConversationList } from '@/components/chat/conversation-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Chat } from '@/types/messaging';

interface DMSidebarProps {
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onSelectFriend: (friendId: string) => void;
}

export function DMSidebar({ activeChatId, onSelectChat, onSelectFriend }: DMSidebarProps) {
  return (
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
            <ConversationList activeChatId={activeChatId} onSelectChat={onSelectChat} />
          </TabsContent>
          <TabsContent value="friends" className="mt-2"><FriendsList onSelectFriend={onSelectFriend} /></TabsContent>
          <TabsContent value="pending" className="mt-2"><PendingRequests /></TabsContent>
          <TabsContent value="sent" className="mt-2"><SentRequests /></TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
