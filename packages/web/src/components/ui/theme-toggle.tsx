"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

function useHydrated() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );
}

export function ThemeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useHydrated();

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size={iconOnly ? "icon" : "sm"}
                className={iconOnly ? undefined : "w-full justify-start gap-2 text-xs"}
                disabled
            >
                <Sun size={14} />
                {iconOnly ? null : "Theme"}
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size={iconOnly ? "icon" : "sm"}
            className={iconOnly ? undefined : "w-full justify-start gap-2 text-xs"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {iconOnly ? null : isDark ? "Light mode" : "Dark mode"}
        </Button>
    );
}