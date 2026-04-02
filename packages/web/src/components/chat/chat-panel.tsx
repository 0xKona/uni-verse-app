'use client';

import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { useMarkRead } from '@/hooks/useMarkRead';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useUsers } from '@/hooks/useUserQuery';
import type { Chat } from '@/types/messaging';

interface ChatPanelProps {
  chat: Chat;
  currentUserId: string;
}

export function ChatPanel({ chat, currentUserId }: ChatPanelProps) {
  const markActive = useMarkRead(chat.chatId);
  const typingUserId = useTypingIndicator(chat.chatId, currentUserId);

  const { data: participants = [] } = useUsers([chat.participantId]);
  const participantName = participants[0]?.username ?? chat.participantId;

  return (
    <main className="flex flex-1 flex-col overflow-hidden" onClick={markActive} onKeyDown={markActive} onFocus={markActive}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">{participantName}</span>
        {chat.archived && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Read-only</span>
        )}
      </div>

      <MessageList chatId={chat.chatId} currentUserId={currentUserId} />
      {typingUserId && (
        <div className="px-4 py-1 text-xs text-muted-foreground animate-pulse">
          {participantName} is typing…
        </div>
      )}
      <MessageInput chatId={chat.chatId} currentUserId={currentUserId} disabled={chat.archived ?? false} />
    </main>
  );
}
