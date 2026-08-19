import Link from "next/link";
import { Languages, Zap } from "lucide-react";
import { BrandMark } from "@/components/landing/top-nav";

const BRAND_FEATURES = [
  {
    icon: Zap,
    title: "Real-time at its core",
    description: "Messages, typing and friend requests, live over AppSync.",
  },
  {
    icon: Languages,
    title: "Chat in any language",
    description: "Every message translated automatically, both ways.",
  },
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-[436px] flex-col overflow-hidden border-r border-border/60 p-8 md:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
        <div className="absolute -left-16 -top-16 size-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-8 size-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Link href="/" className="relative z-10 flex items-center gap-2.5">
        <BrandMark />
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Uni
          <span className="text-brand-gradient">-Verse</span>
        </span>
      </Link>

      <div className="relative z-10 mt-10">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          The messenger built for instant{" "}
          <span className="text-brand-gradient">inter-language communication.</span>
        </h2>

        <ul className="mt-7 space-y-4">
          {BRAND_FEATURES.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-primary/10 text-primary">
                <feature.icon size={16} strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {feature.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 mt-auto pt-8 text-[11px] text-muted-foreground">
        © 2026 Uni-Verse &middot; Built on AWS
      </p>
    </div>
  );
}
