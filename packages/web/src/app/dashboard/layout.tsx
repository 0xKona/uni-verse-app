"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscribeFriendsRealtime } from "@/hooks/useFriendsSubscription";
import { UserSettingsCard } from "@/components/user/user-settings-card";
import { cn } from "@/lib/utils";
import SideBarButton from "@/components/ui/sidebar-button";

const tabs = [
  { href: "/dashboard/dm", icon: MessageCircle, label: "Direct Messages" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Enable real-time updates for friends data
  useSubscribeFriendsRealtime();

  return (
    <div className="flex h-screen bg-background">
      <TooltipProvider delay={200}>
        <nav className="flex flex-col items-center justify-between w-16 py-3 bg-muted border-r border-border">
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
          <UserSettingsCard />
        </nav>
      </TooltipProvider>

      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
