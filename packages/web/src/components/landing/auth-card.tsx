import Link from "next/link";
import { BrandMark } from "@/components/landing/top-nav";
import { AuthBrandPanel } from "@/components/landing/auth-brand-panel";

interface AuthCardProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/60 bg-background/70 shadow-2xl shadow-primary/10 backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />

      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <AuthBrandPanel />

        <div className="flex flex-col gap-5 px-6 py-8 sm:px-8">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 self-center md:hidden"
          >
            <BrandMark />
            <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Uni
              <span className="text-brand-gradient">-Verse</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Real-time messaging, translated both ways.
            </span>
          </Link>

          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
