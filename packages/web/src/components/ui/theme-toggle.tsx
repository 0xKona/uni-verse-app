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

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useHydrated();

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                disabled
            >
                <Sun size={14} />
                Theme
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? "Light mode" : "Dark mode"}
        </Button>
    );
}