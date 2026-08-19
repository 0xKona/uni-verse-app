"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/components/landing/hero-visual";

interface HeroContentProps {
  authenticated: boolean;
}

export function HeroContent({ authenticated }: HeroContentProps) {
  const reduced = usePrefersReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-6 text-center"
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
      >
        <Sparkles size={12} className="text-primary" />
        Real-time translation, built in
      </motion.span>

      <motion.h1
        variants={item}
        className="font-heading max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        Send in your language.{" "}
        <span className="text-brand-gradient">They read it in theirs.</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="max-w-xl text-base text-muted-foreground sm:text-lg"
      >
        Uni-Verse translates every message the moment it is sent...
        automatically, both ways.
      </motion.p>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {authenticated ? (
          <Button
            render={<Link href="/dashboard" />}
            size="lg"
            nativeButton={false}
          >
            Dashboard
            <ArrowRight size={16} />
          </Button>
        ) : (
          <>
            <Button
              render={<Link href="/login" />}
              size="lg"
              nativeButton={false}
            >
              Sign in
              <ArrowRight size={16} />
            </Button>
            <Button
              render={<Link href="/signup" />}
              variant="outline"
              size="lg"
              nativeButton={false}
            >
              Create account
            </Button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
