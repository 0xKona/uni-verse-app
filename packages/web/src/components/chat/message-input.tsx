"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMessage } from "@/hooks/useMessageMutation";
import { apiClient, getUploadUrlMutation } from "@/lib/api";

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
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage(currentUserId);

  const handleSend = async () => {
    if (pendingFile) {
      await handleSendFile();
      return;
    }
    const content = text.trim();
    if (!content) return;
    sendMessage.mutate({ chatId, content, type: "TEXT" });
    setText("");
  };

  const handleSendFile = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      // Get pre-signed upload URL
      const res = await apiClient.graphql({
        query: getUploadUrlMutation,
        variables: { chatId, fileName: pendingFile.name },
      });
      const { url, key } = JSON.parse((res as any).data.getUploadUrl);

      // Upload directly to S3
      await fetch(url, { method: "PUT", body: pendingFile });

      // Send message with S3 key — optimistic update uses blob URL for instant preview
      const isImage = pendingFile.type.startsWith("image/");
      const previewUrl = URL.createObjectURL(pendingFile);
      sendMessage.mutate({
        chatId,
        content: pendingFile.name,
        type: isImage ? "IMAGE" : "FILE",
        attachments: [key],
        _previewUrls: [previewUrl],
      });
      setPendingFile(null);
      setText("");
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
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
    }
  };

  const busy = disabled || uploading || sendMessage.isPending;

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
