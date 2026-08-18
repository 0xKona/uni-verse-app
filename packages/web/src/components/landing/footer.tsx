"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import { BrandMark } from "./top-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const GITHUB_URL = "https://github.com/0xKona/uni-verse-app";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Uni
              <span className="text-brand-gradient">-Verse</span>
            </span>
          </Link>
          <p className="max-w-xs text-center text-xs text-muted-foreground md:text-left">
            Messages without borders: real-time chat that translates itself.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
          >
            <GitBranch size={14} />
            Source
          </a>
          <ThemeToggle iconOnly />
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-xs text-muted-foreground">
            © 2026 Uni-Verse
          </p>
          <p className="text-xs text-muted-foreground">
            Built on AWS, AppSync · Lambda · DynamoDB · Cognito
          </p>
        </div>
      </div>
    </footer>
  );
}
