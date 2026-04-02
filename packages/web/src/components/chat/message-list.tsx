"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Languages, Paperclip } from "lucide-react";
import { useMessages } from "@/hooks/useMessagesQuery";
import { useUserProfile } from "@/hooks/useProfileQuery";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { translateMessage } from "@/lib/api";
import type { Message } from "@/types/messaging";

interface MessageListProps {
  chatId: string;
  currentUserId: string;
}

export function MessageList({ chatId, currentUserId }: MessageListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessages(chatId);
  const { data: profile } = useUserProfile();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.messages).reverse();
  }, [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Loading messages…
      </div>
    );
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
            {isFetchingNextPage ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.messageId}
          message={msg}
          isOwn={msg.senderId === currentUserId}
          userLang={profile?.language ?? "en"}
          translationEnabled={profile?.translationEnabled ?? false}
          chatId={chatId}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  userLang,
  translationEnabled,
  chatId,
}: {
  message: Message;
  isOwn: boolean;
  userLang: string;
  translationEnabled: boolean;
  chatId: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [localTranslations, setLocalTranslations] = useState<
    Record<string, string>
  >({});

  const translations: Record<string, string> = useMemo(() => {
    try {
      const parsed =
        typeof message.translations === "string"
          ? JSON.parse(message.translations)
          : (message.translations ?? {});
      return { ...parsed, ...localTranslations };
    } catch {
      return localTranslations;
    }
  }, [message.translations, localTranslations]);

  const hasTranslation = !!translations[userLang];
  const isTextMessage = message.type === "TEXT";
  const shouldShowTranslated =
    translationEnabled && hasTranslation && !showOriginal && !isOwn;

  const displayContent = shouldShowTranslated
    ? translations[userLang]
    : message.content;

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const updated = await translateMessage(chatId, message.messageId, message.createdAt);
      const parsed = JSON.parse(updated.translations ?? '{}');
      setLocalTranslations(parsed);
    } catch (err) {
      console.error("Translation failed:", err);
    }
    setTranslating(false);
  };

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-3 py-2 text-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md",
        )}
      >
        {message.type === "GIF" ? (
          <img
            src={message.content}
            alt="GIF"
            className="rounded-lg max-w-full"
          />
        ) : message.type === "IMAGE" && message.attachments?.[0] ? (
          <a
            href={message.attachments[0]}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={message.attachments[0]}
              alt={message.content}
              className="rounded-lg max-w-full max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
        ) : message.type === "FILE" && message.attachments?.[0] ? (
          <a
            href={message.attachments[0]}
            download={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 hover:underline",
              isOwn ? "text-primary-foreground" : "text-foreground",
            )}
          >
            <Paperclip size={14} className="shrink-0" />
            <span className="break-all">{message.content}</span>
          </a>
        ) : (
          <p className="wrap-break-word">{displayContent}</p>
        )}

        <div className="flex items-center gap-1 mt-1">
          <span
            className={cn(
              "text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Translation controls — only for text messages from others */}
          {isTextMessage &&
            !isOwn &&
            translationEnabled &&
            (hasTranslation ? (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={cn(
                  "text-[10px] ml-1 hover:underline cursor-pointer",
                  isOwn
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {showOriginal ? "View translated" : "View original"}
              </button>
            ) : (
              <button
                onClick={handleTranslate}
                disabled={translating}
                className={cn(
                  "text-[10px] ml-1 hover:underline cursor-pointer inline-flex items-center gap-0.5",
                  isOwn
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                <Languages size={10} />
                {translating ? "Translating…" : "Translate"}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
