'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { useCreateChat } from '@/hooks/useChatMutation';
import { useMessageSubscription } from '@/hooks/useMessageSubscription';
import { DMSidebar } from '@/components/chat/dm-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import { MobileHeader } from '@/components/dashboard/mobile-header';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Chat } from '@/types/messaging';

export default function DMPage() {
  const currentUserId = useCurrentUserId();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  // Auto-open the sidebar drawer on mobile when landing with no chat selected
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  const createChat = useCreateChat();

  useMessageSubscription(currentUserId || null);

  const handleSelectChat = useCallback((chat: Chat) => {
    setActiveChat({ ...chat, lastReadAt: new Date().toISOString() });
    setSidebarOpen(false);
  }, []);

  const handleSelectFriend = useCallback(async (friendId: string) => {
    const chat = await createChat.mutateAsync(friendId);
    setActiveChat({ ...chat, lastReadAt: new Date().toISOString() });
    setSidebarOpen(false);
  }, [createChat]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent className="p-0 md:hidden">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
              <SheetTitle className="text-sm font-semibold">Menu</SheetTitle>
              <SheetClose className="rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <X size={18} />
                <span className="sr-only">Close menu</span>
              </SheetClose>
            </div>
            <DMSidebar
              activeChatId={activeChat?.chatId ?? null}
              onSelectChat={handleSelectChat}
              onSelectFriend={handleSelectFriend}
              className="w-full flex-1 border-r-0"
            />
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex md:shrink-0">
          <DMSidebar
            activeChatId={activeChat?.chatId ?? null}
            onSelectChat={handleSelectChat}
            onSelectFriend={handleSelectFriend}
          />
        </div>

        {activeChat ? (
          <ChatPanel chat={activeChat} currentUserId={currentUserId} />
        ) : (
          <main className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select a conversation to start messaging
          </main>
        )}
      </div>
    </div>
  );
}
