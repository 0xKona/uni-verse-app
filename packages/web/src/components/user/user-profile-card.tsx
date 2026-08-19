"use client";

import { ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "../ui/card";
import { UserProfilePopover } from "@/components/user/user-profile-popover";
import { capitalizeText } from "@/lib/utils";

export default function UserProfileCard() {
  return (
    <Card
      size="sm"
      className="absolute bottom-4 left-2 w-68 py-0 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.6)] hidden md:block rounded-2xl bg-sidebar/70 backdrop-blur-xl ring-1 ring-sidebar-border transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="p-0">
        <UserProfilePopover
          side="top"
          sideOffset={12}
          triggerClassName="flex w-full items-center gap-3 min-w-0 rounded-2xl px-2.5 py-2.5"
        >
          {({ username, avatarUrl, initials }) => (
            <>
              <Avatar
                size="lg"
                className="shrink-0 shadow-md ring-1 ring-white/10"
              >
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 min-w-0 text-sm font-medium truncate">
                {capitalizeText(username)}
              </span>
              <ChevronUp
                size={14}
                className="shrink-0 text-muted-foreground"
              />
            </>
          )}
        </UserProfilePopover>
      </div>
    </Card>
  );
}