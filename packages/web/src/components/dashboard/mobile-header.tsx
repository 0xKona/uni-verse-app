"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="grid h-14 shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="justify-self-start"
      >
        <Menu size={20} />
      </Button>

      <span className="text-center font-heading text-base font-semibold tracking-tight text-foreground">
        Uni<span className="text-brand-gradient">-Verse</span>
      </span>

      <div className="justify-self-end">
        <ThemeToggle iconOnly />
      </div>
    </div>
  );
}