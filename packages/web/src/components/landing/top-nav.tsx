import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TopNavProps {
  authenticated: boolean;
}

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-8 shrink-0 rounded-lg shadow-lg shadow-primary/20"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brand-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#brand-mark-bg)" />
      <circle cx="16" cy="16" r="5" fill="#ffffff" fillOpacity="0.95" />
      <ellipse
        cx="16"
        cy="16"
        rx="10.5"
        ry="4.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeOpacity="0.65"
        transform="rotate(-24 16 16)"
      />
      <circle cx="24" cy="10.5" r="1.75" fill="#ffffff" fillOpacity="0.8" />
    </svg>
  );
}

export function TopNav({ authenticated }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <BrandMark />
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Uni
            <span className="text-brand-gradient">-Verse</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle iconOnly />
          {authenticated ? (
            <Button
              render={<Link href="/dashboard" />}
              size="sm"
              nativeButton={false}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
              >
                Sign in
              </Button>
              <Button
                render={<Link href="/signup" />}
                size="sm"
                nativeButton={false}
              >
                Get started
                <ArrowRight size={14} />
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}