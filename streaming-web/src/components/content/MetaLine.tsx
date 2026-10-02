import { Fragment } from "react";
import { cn } from "@/lib/cn";

/** Metadata separated by hairline dots: 2025 · PG · 1h 34m · Documentary */
export function MetaLine({ parts, className }: { parts: (string | undefined | null | false)[]; className?: string }) {
  const items = parts.filter(Boolean) as string[];
  if (!items.length) return null;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-muted tabular", className)}>
      {items.map((p, i) => (
        <Fragment key={`${p}-${i}`}>
          {i > 0 && <span aria-hidden className="size-[3px] rounded-full bg-ink-faint" />}
          <span>{p}</span>
        </Fragment>
      ))}
    </p>
  );
}
