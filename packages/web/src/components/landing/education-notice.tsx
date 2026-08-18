"use client";

import { useState } from "react";
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EducationNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(94%,36rem)] -translate-x-1/2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background/85 p-3 shadow-lg backdrop-blur-xl">
        <GraduationCap className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="flex-1 text-sm leading-relaxed text-foreground">
          Uni-Verse is a{" "}
          <span className="font-medium text-primary">educational project,</span>{" "}
          a university assignment demonstrating real-time messaging on AWS.
          Treat it as a sandbox and don&rsquo;t share sensitive personal data.
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss educational notice"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
