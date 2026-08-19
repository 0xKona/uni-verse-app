"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/landing/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import SideBarButton from "@/components/ui/sidebar-button";
import { AddFriendDialog } from "@/components/friends/add-friend-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfilePopover } from "@/components/user/user-profile-popover";

export function MobileBottomBar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const dmActive = pathname.startsWith("/dashboard/dm");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-sidebar-border bg-sidebar/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="relative flex h-16 items-center justify-between px-3">
        <Link
          href="/dashboard/dm"
          aria-label="Uni-Verse"
          className="grid size-10 shrink-0 place-items-center rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <BrandMark />
        </Link>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <TooltipProvider delay={0}>
            <SideBarButton
              href="/dashboard/dm"
              icon={MessageCircle}
              label="Direct Messages"
              active={dmActive}
              badge={unreadCount}
              size="sm"
              hideTooltip
            />
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-1">
          <AddFriendDialog iconOnly />
          <UserProfilePopover
            side="top"
            align="end"
            sideOffset={10}
            triggerClassName="size-10 justify-center rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {({ initials, avatarUrl }) => (
              <Avatar className="size-8">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            )}
          </UserProfilePopover>
        </div>
      </div>
    </div>
  );
}