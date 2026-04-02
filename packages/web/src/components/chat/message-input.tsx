"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSendMessage } from "@/hooks/useMessageMutation";
import { useSendTyping } from "@/hooks/useTypingIndicator";
import { useUploadFile } from "@/hooks/useUploadFile";
import { GifPicker } from "@/components/chat/gif-picker";

interface MessageInputProps {
  chatId: string;
  currentUserId: string;
  disabled?: boolean;
}

export function MessageInput({
  chatId,
  currentUserId,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [gifOpen, setGifOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage(currentUserId);
  const uploadFile = useUploadFile();
  const sendTyping = useSendTyping(chatId);

  const handleSend = () => {
    if (pendingFile) {
      uploadFile.mutate(
        { chatId, file: pendingFile },
        {
          onSuccess: ({ key, previewUrl, isImage, fileName }) => {
            sendMessage.mutate({
              chatId,
              content: fileName,
              type: isImage ? "IMAGE" : "FILE",
              attachments: [key],
              _previewUrls: [previewUrl],
            });
            setPendingFile(null);
            setText("");
          },
        },
      );
      return;
    }
    const content = text.trim();
    if (!content) return;
    sendMessage.mutate({ chatId, content, type: "TEXT" });
    setText("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      sendTyping();
    }
  };

  const handleGifSelect = (url: string) => {
    sendMessage.mutate({ chatId, content: url, type: "GIF" });
    setGifOpen(false);
  };

  const busy = disabled || uploadFile.isPending || sendMessage.isPending;

  return (
    <div className="border-t border-border">
      {pendingFile && (
        <div className="flex items-center gap-2 px-4 pt-3">
          {pendingFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(pendingFile)}
              alt={pendingFile.name}
              className="h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              <Paperclip size={12} />
              <span className="truncate max-w-48">{pendingFile.name}</span>
            </div>
          )}
          <button
            onClick={() => setPendingFile(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={busy}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Paperclip size={16} />
        </Button>
        <Popover open={gifOpen} onOpenChange={setGifOpen}>
          <PopoverTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors">
            <SmilePlus size={16} className="text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="p-0 w-auto">
            <GifPicker onSelect={handleGifSelect} />
          </PopoverContent>
        </Popover>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "This conversation is read-only" : "Type a message…"
          }
          disabled={busy}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={busy || (!text.trim() && !pendingFile)}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
