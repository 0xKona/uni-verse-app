"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSubscribeFriendsRealtime } from "@/hooks/useFriendsSubscription";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import SideBarButton from "@/components/ui/sidebar-button";
import UserProfileCard from "@/components/user/user-profile-card";
import { MobileBottomBar } from "@/components/dashboard/mobile-bottom-bar";

const tabs = [
  { href: "/dashboard/dm", icon: MessageCircle, label: "Direct Messages" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const authorized = useRequireAuth();
  const unreadChatCount = useUnreadChatCount();

  // Enable real-time updates for friends data
  useSubscribeFriendsRealtime();

  if (!authorized) return null;

  return (
    <div className="relative flex h-dvh bg-background">
      <TooltipProvider delay={200}>
        <nav className="relative hidden md:flex flex-col items-center w-16 py-3 pb-14 bg-sidebar border-r border-sidebar-border">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-16 w-px bg-gradient-to-b from-primary/40 via-sidebar-border to-transparent" />
          <div className="flex flex-col items-center gap-2">
            {tabs.map(({ href, icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <SideBarButton
                  key={href + label}
                  href={href}
                  icon={icon}
                  label={label}
                  active={active}
                  badge={href === "/dashboard/dm" ? unreadChatCount : undefined}
                />
              );
            })}
          </div>
        </nav>
      </TooltipProvider>

      <div className="flex flex-1 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>

      <UserProfileCard />
      <MobileBottomBar unreadCount={unreadChatCount} />
    </div>
  );
}
