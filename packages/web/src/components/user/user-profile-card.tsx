"use client";

import { useState, useEffect } from "react";
import { LogOut, Globe, ChevronUp } from "lucide-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logout } from "@/lib/auth";
import { LANGUAGES } from "@/lib/languages";
import { useUserProfile } from "@/hooks/useProfileQuery";
import { useSetUserProfile } from "@/hooks/useProfileMutation";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { capitalizeText } from "@/lib/utils";

export default function UserProfileCard() {
  const [username, setUsername] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { data: profile } = useUserProfile();
  const setProfile = useSetUserProfile();
  const router = useRouter();

  useEffect(() => {
    fetchUserAttributes()
      .then((attrs) => setUsername(attrs.preferred_username ?? ""))
      .catch(console.error);
  }, []);

  const initials = username[0]?.toUpperCase() ?? "?";
  const currentLang = profile?.language ?? "en";
  const translationOn = profile?.translationEnabled ?? false;

  const handleLanguageChange = (code: string | null) => {
    if (!code) return;
    setProfile.mutate({ language: code, translationEnabled: translationOn });
  };

  const handleTranslationToggle = () => {
    setProfile.mutate({
      language: currentLang,
      translationEnabled: !translationOn,
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <>
      <Card size="sm" className="absolute bottom-4 left-3 w-68 py-0 shadow-lg">
        <CardContent className="flex items-center gap-3">
          <Avatar size="lg">
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

            {/* Dropdown */}
            <PopoverContent
              side="top"
              align="start"
              sideOffset={12}
              className="w-60 p-0"
            >
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Globe size={12} />
                  Translation
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="translation-toggle" className="text-xs">
                    Auto-translate
                  </Label>
                  <button
                    id="translation-toggle"
                    role="switch"
                    aria-checked={translationOn}
                    onClick={handleTranslationToggle}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      translationOn ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                        translationOn ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Language</Label>
                  <Select
                    value={currentLang}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(({ code, label }) => (
                        <SelectItem key={code} value={code} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={14} />
                  Log out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

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
