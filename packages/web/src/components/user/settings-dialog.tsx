"use client";

import { useRef, useState } from "react";
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
import { LANGUAGES } from "@/lib/languages";
import { useUserProfile } from "@/hooks/useProfileQuery";
import {
  useSetUserProfile,
  useUpdateUsername,
  useUpdateAvatar,
  useChangePassword,
} from "@/hooks/useProfileMutation";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  avatarUrl?: string | null;
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
  const changePassword = useChangePassword();

  // Username
  const [newUsername, setNewUsername] = useState(username);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = () => {
    if (!pendingFile) return;
    updateAvatar.mutate(pendingFile, {
      onSuccess: () => {
        setPendingFile(null);
      },
    });
  };

  const handleSaveUsername = () => {
    if (!newUsername.trim() || newUsername === username) return;
    updateUsername.mutate(newUsername.trim());
  };

  const handleSavePassword = () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: () => setPasswordError("Incorrect current password."),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex flex-col gap-3">
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={avatarPreview ?? avatarUrl ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose image
                </Button>
                {pendingFile && (
                  <Button
                    size="sm"
                    onClick={handleSaveAvatar}
                    disabled={updateAvatar.isPending}
                  >
                    {updateAvatar.isPending ? "Uploading…" : "Save"}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            {updateAvatar.isError && (
              <p className="text-xs text-destructive">Upload failed. Try again.</p>
            )}
          </div>

          <Separator />

          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input
                id="username"
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
            {updateUsername.isError && (
              <p className="text-xs text-destructive">Failed to update username.</p>
            )}
          </div>

          <Separator />

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-xs text-destructive">{passwordError}</p>
            )}
            <Button
              size="sm"
              className="self-end"
              onClick={handleSavePassword}
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {changePassword.isPending ? "Saving…" : "Change password"}
            </Button>
          </div>

          <Separator />

          {/* Translation */}
          <div className="flex flex-col gap-3">
            <Label>Translation</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="translation-toggle" className="text-xs font-normal">
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal">Language</Label>
              <Select
                value={currentLang}
                onValueChange={(code) =>
                  setProfile.mutate({ language: code as string, translationEnabled: translationOn })
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
