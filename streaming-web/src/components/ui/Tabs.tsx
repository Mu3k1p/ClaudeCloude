"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface TabItem<K extends string> {
  key: K;
  label: string;
  count?: number;
}

/** ARIA tabs with roving focus (←/→/Home/End) and a sliding champagne underline. */
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  label,
  children,
}: {
  items: TabItem<K>[];
  value: K;
  onChange: (k: K) => void;
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent) => {
    const i = items.findIndex((t) => t.key === value);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[n].key);
    list.current?.querySelectorAll<HTMLElement>("[role=tab]")[n]?.focus();
  };

  return (
    <>
      <div ref={list} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line md:gap-9">
        {items.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={active}
              aria-controls={`${id}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.key)}
              className={cn("relative shrink-0 pb-3.5 pt-1 text-[14px] transition-colors", active ? "text-ink" : "text-ink-muted hover:text-ink")}
            >
              {t.label}
              {t.count != null && <span className="ml-2 font-mono text-[11px] text-ink-faint tabular">{t.count}</span>}
              {active && <motion.span layoutId={`${id}-underline`} className="absolute inset-x-0 -bottom-px h-px bg-accent" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${value}`} tabIndex={0} className="outline-none">
        {children}
      </div>
    </>
  );
}
