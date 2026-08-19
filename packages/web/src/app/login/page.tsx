"use client";
import { useState } from "react";
import { login, forgotPassword, confirmPasswordReset } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/landing/auth-layout";
import { AuthCard } from "@/components/landing/auth-card";
import Link from "next/link";

type View = "signin" | "forgot" | "forgot-confirm";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Login failed" });
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setView("forgot-confirm");
    } catch (err: unknown) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Couldn't start password reset" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmPasswordReset(email.trim(), code.trim(), newPassword);
      setView("signin");
      setPassword("");
      setNewPassword("");
      setCode("");
      setNotice({
        kind: "success",
        text: "Password updated. Sign in with your new password.",
      });
    } catch (err: unknown) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Password reset failed" });
    } finally {
      setLoading(false);
    }
  };

  const backToSignIn = () => {
    setNotice(null);
    setLoading(false);
    setView("signin");
  };

  return (
    <AuthLayout>
      {view === "signin" && (
        <AuthCard
          title="Welcome back"
          description="Sign in to keep the conversation going"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setNotice(null);
                    setView("forgot");
                  }}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {notice?.kind === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {notice.text}
              </p>
            )}
            {notice?.kind === "success" && (
              <p role="status" className="text-sm text-primary">
                {notice.text}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </AuthCard>
      )}

      {view === "forgot" && (
        <AuthCard
          title="Reset password"
          description="We'll email you a one-time code to reset your password"
        >
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {notice?.kind === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {notice.text}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "Sending code…" : "Send reset code"}
            </Button>
          </form>
          <button
            type="button"
            onClick={backToSignIn}
            className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </AuthCard>
      )}

      {view === "forgot-confirm" && (
        <AuthCard
          title="Set a new password"
          description={
            <>
              Enter the code sent to <span className="font-medium text-foreground">{email}</span>
            </>
          }
        >
          <form onSubmit={handleResetConfirm} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reset-code">Verification code</Label>
              <Input
                id="reset-code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {newPassword.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                <PasswordStrength password={newPassword} />
              </div>
            )}
            {notice?.kind === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {notice.text}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
          <button
            type="button"
            onClick={backToSignIn}
            className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </AuthCard>
      )}
    </AuthLayout>
  );
}