"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p id={`${id}-l`} className="text-[14.5px] text-ink">{label}</p>
        {description && <p id={`${id}-d`} className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={description ? `${id}-d` : undefined}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300", checked ? "border-accent/60 bg-accent/80" : "border-line-strong bg-raised")}
      >
        <span className={cn("absolute top-1/2 size-[18px] -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ease-[var(--ease-cinema)]", checked ? "left-[22px] bg-accent-ink" : "left-[2px] bg-ink-muted")} />
      </button>
    </div>
  );
}
