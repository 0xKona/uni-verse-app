"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useChangePassword } from "@/hooks/useProfileMutation";

const TEST_EMAILS = ["univese.test.1@gmail.com", "testskillforge@gmail.com"];

export default function ChangePassword() {
  const user = useCurrentUserId();
  const changePassword = useChangePassword();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentInvalid, setCurrentInvalid] = useState(false);
  const [submittedMismatch, setSubmittedMismatch] = useState(false);
  const [isTestEmail, setIsTestEmail] = useState(false);

  useEffect(() => {
    setIsTestEmail(TEST_EMAILS.includes(user));
  }, [user]);

  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const showMismatch = submittedMismatch || confirmMismatch;

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      setSubmittedMismatch(true);
      return;
    }
    setSubmittedMismatch(false);
    setCurrentInvalid(false);
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Password changed.");
        },
        onError: () => {
          setCurrentInvalid(true);
          toast.error("Incorrect current password.");
        },
      }
    );
  };

  const canSubmit =
    !changePassword.isPending &&
    !!currentPassword &&
    !!newPassword &&
    !!confirmPassword;

  return (
    <div className="flex flex-col gap-2">
      <PasswordInput
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value);
          setCurrentInvalid(false);
        }}
        disabled={isTestEmail}
        aria-invalid={currentInvalid}
        aria-label="Current password"
      />
      <PasswordInput
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isTestEmail}
        aria-label="New password"
      />
      {newPassword.length > 0 && !isTestEmail && (
        <PasswordStrength password={newPassword} />
      )}
      <PasswordInput
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isTestEmail}
        aria-invalid={showMismatch}
        aria-label="Confirm new password"
      />
      {showMismatch && (
        <p className="text-xs text-destructive" role="alert">
          Passwords do not match.
        </p>
      )}
      {isTestEmail && (
        <p className="text-xs text-destructive">
          You are using a test email. Password changes are not saved.
        </p>
      )}
      <Button
        size="sm"
        className="self-end"
        onClick={handleSavePassword}
        disabled={!canSubmit}
      >
        {changePassword.isPending ? "Saving…" : "Change password"}
      </Button>
    </div>
  );
}