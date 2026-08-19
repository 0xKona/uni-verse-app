"use client";

import { Fragment, useMemo, useRef, useEffect, useState } from "react";
import { Check, Clock, Languages, Paperclip } from "lucide-react";
import { useMessages } from "@/hooks/useMessagesQuery";
import { useUserProfile } from "@/hooks/useProfileQuery";
import { useUsers } from "@/hooks/useUserQuery";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageListSkeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslateMessage } from "@/hooks/useTranslateMessage";
import type { Message } from "@/types/messaging";
import type { User } from "@/types/friends";

interface MessageListProps {
  chatId: string;
  currentUserId: string;
  participantId: string;
}

function sameCalendarDay(aIso: string, bIso: string): boolean {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MessageList({
  chatId,
  currentUserId,
  participantId,
}: MessageListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessages(chatId);
  const { data: profile } = useUserProfile();
  const { data: participants = [] } = useUsers(participantId ? [participantId] : []);
  const participant = participants[0];
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);
  const initialScrollDone = useRef(false);

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((p) => p.messages).reverse();
  }, [data]);

  // Group consecutive messages from the same sender (day changes always split runs)
  const runs = useMemo(() => {
    const out: { senderId: string; messages: Message[] }[] = [];
    for (const msg of messages) {
      const prev = out[out.length - 1];
      if (
        prev &&
        prev.senderId === msg.senderId &&
        sameCalendarDay(prev.messages[0].createdAt, msg.createdAt)
      ) {
        prev.messages.push(msg);
      } else {
        out.push({ senderId: msg.senderId, messages: [msg] });
      }
    }
    return out;
  }, [messages]);

  // Reset on chat change
  useEffect(() => {
    initialScrollDone.current = false;
  }, [chatId]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (!messages.length) return;
    if (!initialScrollDone.current) {
      // Initial load — scroll instantly, no smooth animation
      bottomRef.current?.scrollIntoView();
      initialScrollDone.current = true;
    } else if (prevHeightRef.current === 0) {
      // New message arrived — smooth scroll
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevHeightRef.current = 0;
  }, [messages.length]);

  // Restore scroll position after loading older messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prevHeightRef.current === 0) return;
    el.scrollTop = el.scrollHeight - prevHeightRef.current;
    prevHeightRef.current = 0;
  }, [data?.pages.length]);

  const handleLoadOlder = () => {
    const el = scrollRef.current;
    if (el) prevHeightRef.current = el.scrollHeight;
    fetchNextPage();
  };

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
      {hasNextPage && (
        <div className="flex justify-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadOlder}
            disabled={isFetchingNextPage}
            className="text-xs"
          >
            {isFetchingNextPage ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}

      {runs.map((run, runIndex) => {
        const isOwnRun = run.senderId === currentUserId;
        const prevRun = runs[runIndex - 1];
        const showDivider =
          !!prevRun &&
          !sameCalendarDay(
            prevRun.messages[0].createdAt,
            run.messages[0].createdAt,
          );

        return (
          <Fragment key={run.messages[0].messageId}>
            {showDivider && <DayDivider date={run.messages[0].createdAt} />}
            <div
              className={cn("flex flex-col", isOwnRun ? "items-end" : "items-start")}
            >
              {run.messages.map((msg, msgIndex) => (
                <MessageBubble
                  key={msg.messageId}
                  message={msg}
                  isOwn={msg.senderId === currentUserId}
                  isGroupLast={msgIndex === run.messages.length - 1}
                  isGroupStart={msgIndex === 0}
                  participant={participant}
                  userLang={profile?.language ?? "en"}
                  translationEnabled={profile?.translationEnabled ?? false}
                  chatId={chatId}
                />
              ))}
            </div>
          </Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

function DayDivider({ date }: { date: string }) {
  return (
    <div className="my-3 flex items-center justify-center">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
        {formatDayLabel(date)}
      </span>
    </div>
  );
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startToday.getTime() - startDay.getTime()) / 86400000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}

function MessageBubble({
  message,
  isOwn,
  isGroupLast,
  isGroupStart,
  participant,
  userLang,
  translationEnabled,
  chatId,
}: {
  message: Message;
  isOwn: boolean;
  isGroupLast: boolean;
  isGroupStart: boolean;
  participant?: User;
  userLang: string;
  translationEnabled: boolean;
  chatId: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [localTranslations, setLocalTranslations] = useState<
    Record<string, string>
  >({});
  const translate = useTranslateMessage();

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

  const isSending = message.messageId.startsWith("optimistic-");

  const handleTranslate = () => {
    translate.mutate(
      { chatId, messageId: message.messageId, timestamp: message.createdAt },
      {
        onSuccess: (updated) => {
          const parsed = JSON.parse(updated.translations ?? '{}');
          setLocalTranslations(parsed);
        },
      },
    );
  };

  const timeLabel = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex w-full max-w-full items-end gap-1.5",
        isOwn ? "justify-end" : "justify-start",
        isGroupStart ? "mt-1.5" : "mt-0.5",
      )}
    >
      {/* Avatar column — only the last message of a run shows the avatar */}
      {!isOwn && (
        <div className="w-7 shrink-0">
          {isGroupLast && participant && (
            <Avatar className="size-7">
              <AvatarImage
                src={participant.avatarUrl ?? undefined}
                alt={participant.username}
              />
              <AvatarFallback>{getInitials(participant.username)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-3 py-2 text-sm sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[78%]",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
          isGroupLast ? (isOwn ? "rounded-br-md" : "rounded-bl-md") : null,
        )}
      >
        {message.type === "GIF" ? (
          <img
            src={message.content}
            alt="GIF"
            className="max-h-56 max-w-full rounded-lg object-cover ring-1 ring-border/40"
          />
        ) : message.type === "IMAGE" && message.attachments?.[0] ? (
          <a
            href={message.attachments[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg ring-1 ring-border/40 transition duration-200 hover:ring-primary/60"
          >
            <img
              src={message.attachments[0]}
              alt={message.content}
              className="max-h-64 max-w-full cursor-pointer object-cover transition duration-200 hover:scale-[1.02]"
            />
          </a>
        ) : message.type === "FILE" && message.attachments?.[0] ? (
          <a
            href={message.attachments[0]}
            download={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 ring-1 transition",
              isOwn
                ? "bg-primary-foreground/10 ring-primary-foreground/20 hover:bg-primary-foreground/15"
                : "bg-background/60 ring-border/40 hover:bg-muted/80",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md",
                isOwn ? "bg-primary-foreground/10" : "bg-muted",
              )}
            >
              <Paperclip size={14} />
            </span>
            <span className="break-all text-xs font-medium">{message.content}</span>
          </a>
        ) : (
          <p className="wrap-break-word">{displayContent}</p>
        )}

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOwn ? "justify-end text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          <span>{timeLabel}</span>

          {isOwn &&
            (isSending ? (
              <Clock className="size-3" aria-label="Sending" />
            ) : (
              <Check className="size-3" aria-label="Delivered" />
            ))}

          {/* Translation controls — only for text messages from others */}
          {isTextMessage &&
            !isOwn &&
            translationEnabled &&
            (hasTranslation ? (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
              >
                <Languages size={10} />
                {showOriginal ? "View translated" : "View original"}
              </button>
            ) : (
              <button
                onClick={handleTranslate}
                disabled={translate.isPending}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors hover:bg-muted-foreground/10 hover:text-foreground disabled:opacity-60"
              >
                <Languages size={10} />
                {translate.isPending ? "Translating…" : "Translate"}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}