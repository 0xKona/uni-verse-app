"use client";

import { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logout } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useUser } from "@/hooks/useUserQuery";
import { SettingsDialog } from "./settings-dialog/settings-dialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfilePopoverProps {
  children: (data: {
    userId: string;
    username: string;
    avatarUrl: string | null | undefined;
    initials: string;
  }) => React.ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end";
  sideOffset?: number;
  triggerClassName?: string;
}

export function UserProfilePopover({
  children,
  side = "top",
  align = "start",
  sideOffset = 12,
  triggerClassName,
}: UserProfilePopoverProps) {
  const [cognitoUsername, setCognitoUsername] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Bumped on every open so SettingsDialog remounts and re-prepopulates its username field
  const [settingsOpens, setSettingsOpens] = useState(0);
  const router = useRouter();

  const userId = useCurrentUserId();
  const { data: userRecord } = useUser(userId || null);

  useEffect(() => {
    fetchUserAttributes()
      .then((attrs) => setCognitoUsername(attrs.preferred_username ?? ""))
      .catch(console.error);
  }, []);

  const username = userRecord?.username ?? cognitoUsername;
  const avatarUrl = userRecord?.avatarUrl;
  const initials = username[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.replace("/login");
  };

  return (
    <>
      <Popover>
        <PopoverTrigger
          className={cn(
            "flex items-center cursor-pointer transition-colors",
            triggerClassName,
          )}
        >
          {children({ userId, username, avatarUrl, initials })}
        </PopoverTrigger>

        <PopoverContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="w-48 gap-2 p-2"
        >
          <ThemeToggle />
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => {
              setShowSettings(true);
              setSettingsOpens((n) => n + 1);
            }}
          >
            <Settings size={14} />
            Settings
          </Button>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={14} />
            Log out
          </Button>
        </PopoverContent>
      </Popover>

      <SettingsDialog
        key={settingsOpens}
        open={showSettings}
        onOpenChange={setShowSettings}
        userId={userId}
        username={username}
        avatarUrl={avatarUrl}
      />

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}