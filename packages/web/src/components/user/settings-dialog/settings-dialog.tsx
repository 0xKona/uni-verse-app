"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/languages";
import { useUserProfile } from "@/hooks/useProfileQuery";
import {
  useSetUserProfile,
  useUpdateUsername,
  useUpdateAvatar,
} from "@/hooks/useProfileMutation";
import ChangePassword from "./change-password";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  avatarUrl?: string | null;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  userId,
  username,
  avatarUrl,
}: SettingsDialogProps) {
  const { data: profile } = useUserProfile();
  const setProfile = useSetUserProfile();
  const updateUsername = useUpdateUsername(userId);
  const updateAvatar = useUpdateAvatar(userId);

  // Username — prepopulated with the current username
  const [newUsername, setNewUsername] = useState(username);

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = username[0]?.toUpperCase() ?? "?";
  const currentLang = profile?.language ?? "en";
  const translationOn = profile?.translationEnabled ?? false;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const resetAvatarPreview = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setPendingFile(null);
  };

  const handleSaveAvatar = () => {
    if (!pendingFile) return;
    updateAvatar.mutate(pendingFile, {
      onSuccess: () => {
        resetAvatarPreview();
        toast.success("Profile photo updated.");
      },
      onError: () => toast.error("Upload failed. Try again."),
    });
  };

  const handleSaveUsername = () => {
    if (!newUsername.trim() || newUsername === username) return;
    updateUsername.mutate(newUsername.trim(), {
      onError: () => toast.error("Failed to update username."),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetAvatarPreview();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Avatar */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Profile photo</SectionHeading>
            <div className="flex flex-wrap items-center gap-4">
              <div className="group/avatar relative shrink-0">
                <Avatar
                  size="lg"
                  className={cn(
                    "transition-shadow duration-200",
                    pendingFile && "ring-2 ring-primary/60 ring-offset-2",
                  )}
                >
                  <AvatarImage src={avatarPreview ?? avatarUrl ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 z-10 grid place-items-center rounded-full bg-background/50 text-popover-foreground opacity-0 transition-opacity duration-150 outline-none hover:opacity-100 focus-visible:opacity-100"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose image
                </Button>
                {pendingFile && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveAvatar}
                      disabled={updateAvatar.isPending}
                    >
                      {updateAvatar.isPending ? "Uploading…" : "Save"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAvatarPreview}
                      disabled={updateAvatar.isPending}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
            {pendingFile && (
              <p className="text-xs text-muted-foreground">
                Preview of your new photo. Save to apply it.
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </section>

          <Separator />

          {/* Username */}
          <section className="flex flex-col gap-2">
            <SectionHeading>Username</SectionHeading>
            <div className="flex gap-2">
              <Input
                id="username"
                aria-label="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleSaveUsername}
                disabled={
                  updateUsername.isPending ||
                  !newUsername.trim() ||
                  newUsername === username
                }
              >
                {updateUsername.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </section>

          <Separator />

          {/* Password */}
          <section className="flex flex-col gap-2">
            <SectionHeading>Password</SectionHeading>
            <ChangePassword />
          </section>

          <Separator />

          {/* Translation */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Translation</SectionHeading>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="translation-toggle"
                className="text-xs font-normal"
              >
                Auto-translate messages
              </Label>
              <button
                id="translation-toggle"
                role="switch"
                aria-checked={translationOn}
                onClick={() =>
                  setProfile.mutate({
                    language: currentLang,
                    translationEnabled: !translationOn,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal">Language</Label>
              <Select
                value={currentLang}
                onValueChange={(code) =>
                  setProfile.mutate({
                    language: code as string,
                    translationEnabled: translationOn,
                  })
                }
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
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}