'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessagesQuery';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/messaging';

interface MessageListProps {
  chatId: string;
  currentUserId: string;
}

export function MessageList({ chatId, currentUserId }: MessageListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessages(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Flatten pages and reverse so oldest is at top
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(p => p.messages).reverse();
  }, [data]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading messages…</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
      {hasNextPage && (
        <div className="flex justify-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load older messages'}
          </Button>
        </div>
      )}

      {messages.map(msg => (
        <MessageBubble key={msg.messageId} message={msg} isOwn={msg.senderId === currentUserId} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[70%] rounded-2xl px-3 py-2 text-sm',
        isOwn
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted rounded-bl-md',
      )}>
        {message.type === 'GIF' ? (
          <img src={message.content} alt="GIF" className="rounded-lg max-w-full" />
        ) : message.type === 'IMAGE' ? (
          <img src={message.content} alt="Image" className="rounded-lg max-w-full" />
        ) : (
          <p className="break-words">{message.content}</p>
        )}
        <span className={cn(
          'block text-[10px] mt-1',
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground',
        )}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
