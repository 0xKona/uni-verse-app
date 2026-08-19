"use client";

import { ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "../ui/card";
import { UserProfilePopover } from "@/components/user/user-profile-popover";
import { capitalizeText } from "@/lib/utils";

export default function UserProfileCard() {
  return (
    <Card
      size="sm"
      className="absolute bottom-4 left-3 w-68 py-0 shadow-lg hidden md:block"
    >
      <CardContent className="flex items-center gap-3">
        <UserProfilePopover
          side="top"
          sideOffset={12}
          triggerClassName="flex items-center gap-3 min-w-0 rounded-md px-2 py-3 hover:bg-accent"
        >
          {({ username, avatarUrl, initials }) => (
            <>
              <Avatar size="lg" className="shrink-0">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 min-w-0 text-m font-medium truncate">
                {capitalizeText(username)}
              </span>
              <ChevronUp
                size={14}
                className="shrink-0 text-muted-foreground ml-2"
              />
            </>
          )}
        </UserProfilePopover>
      </CardContent>
    </Card>
  );
}