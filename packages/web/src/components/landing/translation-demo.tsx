"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { usePrefersReducedMotion } from "@/components/landing/hero-visual";

const CYCLED_CODES = ["en", "es", "fr", "ja"] as const;
const HOLD_MS = 2000;

const MESSAGES: Record<(typeof CYCLED_CODES)[number], string> = {
  en: "Sure! Let's meet at noon.",
  es: "¡Claro! Nos vemos al mediodía.",
  fr: "Bien sûr ! On se retrouve à midi.",
  ja: "もちろん！昼に会いましょう。",
};

export function TranslationDemo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(
      () => setIndex((prev) => (prev + 1) % CYCLED_CODES.length),
      HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [index]);

  const code = CYCLED_CODES[index];
  const label = LANGUAGES.find((l) => l.code === code)?.label ?? code;
  const text = MESSAGES[code];

  const morph = reduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.88, filter: "blur(8px)" };
  const arrive = reduced
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, filter: "blur(0px)" };

  return (
    <div className="w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/70 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-gradient text-primary-foreground">
            <Languages size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Aria · Barcelona
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              live translation
            </p>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-left text-sm text-primary-foreground">
            Want to grab coffee tomorrow?
          </div>

          <div className="max-w-[80%]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={code}
                initial={morph}
                animate={arrive}
                exit={morph}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm text-foreground">
                  {text}
                </p>
                <p className="mt-1 px-1 text-[11px] text-muted-foreground">
                  Translated · {label}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="border-t border-border/60 px-4 py-2.5 text-center text-xs text-muted-foreground">
          Everyone in the chat reads in their own language.
        </p>
      </div>
    </div>
  );
}