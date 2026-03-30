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
            {tabs.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Tooltip key={href}>
                  <TooltipTrigger
                    className={cn(
                      "flex items-center justify-center w-12 h-12 bg-background text-muted-foreground transition-all duration-200",
                      active
                        ? "rounded-2xl bg-primary text-primary-foreground"
                        : "rounded-full hover:rounded-2xl hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    <Link href={href}>
                      <Icon size={22} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
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
