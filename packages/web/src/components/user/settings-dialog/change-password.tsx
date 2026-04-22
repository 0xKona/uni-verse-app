"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useChangePassword } from "@/hooks/useProfileMutation";
import { useEffect, useState } from "react";

const TEST_EMAILS = ["univese.test.1@gmail.com", "testskillforge@gmail.com"]

export default function ChangePassword() {
  const user = useCurrentUserId();
  const changePassword = useChangePassword();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isTestEmail, setIsTestEmail] = useState(false);

  useEffect(() => {
    setIsTestEmail(TEST_EMAILS.includes(user));
  }, [user]);


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
    <div className="flex flex-col gap-2">
      <Label>Password</Label>
      <Input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        disabled={isTestEmail}
      />
      <Input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isTestEmail}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isTestEmail}
      />
      {isTestEmail && (
        <p className="text-xs text-destructive">You are using a test email. Password changes are not saved.</p>
      )}
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
  );
}
