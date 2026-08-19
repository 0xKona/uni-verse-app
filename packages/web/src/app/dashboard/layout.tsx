"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSubscribeFriendsRealtime } from "@/hooks/useFriendsSubscription";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import SideBarButton from "@/components/ui/sidebar-button";
import UserProfileCard from "@/components/user/user-profile-card";

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

  // Enable real-time updates for friends data
  useSubscribeFriendsRealtime();

  if (!authorized) return null;

  return (
    <div className="relative flex h-screen bg-background">
      <TooltipProvider delay={200}>
        <nav className="flex flex-col items-center w-16 py-3 pb-14 bg-muted border-r border-border">
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
                />
              );
            })}
          </div>
        </nav>
      </TooltipProvider>

      <div className="flex flex-1 overflow-hidden">{children}</div>

      <UserProfileCard />
    </div>
  );
}
