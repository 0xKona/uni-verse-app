import React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/** Placeholder rows for conversation/friend/request lists (avatar + two text lines). */
export function ListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-0.5", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-md px-2 py-2">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-2/5 max-w-24" />
            <Skeleton className="h-2.5 w-1/3 max-w-20 opacity-70" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Placeholder bubbles for the message list (alternating own/other). */
export function MessageListSkeleton({ count = 6 }: { count?: number }) {
  const widths = [55, 65, 45, 70, 50, 60];
  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-3"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => {
        const isOwn = i % 2 === 0;
        return (
          <div
            key={i}
            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
          >
            <Skeleton
              className={cn(
                "h-8 max-w-[70%] rounded-2xl",
                isOwn ? "bg-primary/15" : "bg-muted",
              )}
              style={{ width: `${widths[i % widths.length]}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export { Skeleton };