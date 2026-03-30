'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSendMessage } from '@/hooks/useMessageMutation';

interface MessageInputProps {
  chatId: string;
  currentUserId: string;
  disabled?: boolean;
}

export function MessageInput({ chatId, currentUserId, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const sendMessage = useSendMessage(currentUserId);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    sendMessage.mutate({ chatId, content, type: 'TEXT' });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'This conversation is read-only' : 'Type a message…'}
        disabled={disabled || sendMessage.isPending}
        className="flex-1"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled || !text.trim() || sendMessage.isPending}
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
