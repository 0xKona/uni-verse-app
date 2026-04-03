"use client";

import { useState, useEffect } from "react";
import { LogOut, Settings, ChevronUp } from "lucide-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { logout } from "@/lib/auth";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useUser } from "@/hooks/useUserQuery";
import { SettingsDialog } from "./settings-dialog";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { capitalizeText } from "@/lib/utils";

export default function UserProfileCard() {
  const [cognitoUsername, setCognitoUsername] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const userId = useCurrentUserId();
  const { data: userRecord } = useUser(userId || null);

  useEffect(() => {
    fetchUserAttributes()
      .then((attrs) => setCognitoUsername(attrs.preferred_username ?? ""))
      .catch(console.error);
  }, []);

  // Prefer live Cognito data from userRecord, fall back to local state
  const username = userRecord?.username ?? cognitoUsername;
  const avatarUrl = userRecord?.avatarUrl;
  const initials = username[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <>
      <Card size="sm" className="absolute bottom-4 left-3 w-68 py-0 shadow-lg">
        <CardContent className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <Popover>
            <PopoverTrigger className="flex flex-1 items-center justify-between min-w-0 cursor-pointer rounded-md px-2 py-3 hover:bg-accent transition-colors">
              <span className="text-m font-medium truncate">
                {capitalizeText(username)}
              </span>
              <ChevronUp
                size={14}
                className="shrink-0 text-muted-foreground ml-2"
              />
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="start"
              sideOffset={12}
              className="w-48 p-1"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => setShowSettings(true)}
              >
                <Settings size={14} />
                Settings
              </Button>
              <Separator className="my-1" />
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
        </CardContent>
      </Card>

      <SettingsDialog
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
