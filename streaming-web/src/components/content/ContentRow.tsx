"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContentRowProps<T> {
  title: string;
  subtitle?: string;
  href?: string;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Width classes for each slot (see cardVariants.RAIL_WIDTH). */
  itemClassName?: string;
  className?: string;
}

/**
 * Horizontal rail. Native scroll with snap (touch and trackpad feel right),
 * paging arrows on hover-capable screens, and arrow-key navigation between
 * cards for keyboard users.
 */
export function ContentRow<T>({ title, subtitle, href, items, getKey, renderItem, itemClassName, className }: ContentRowProps<T>) {
  const headingId = useId();
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges, items.length]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.82, behavior: "smooth" });
  };

  // ArrowLeft / ArrowRight move focus to the same control in the neighbouring card.
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const li = (e.target as HTMLElement).closest("li");
    if (!li) return;
    const next = (e.key === "ArrowRight" ? li.nextElementSibling : li.previousElementSibling) as HTMLElement | null;
    const target = next?.querySelector<HTMLElement>("[data-card-link]") ?? next?.querySelector<HTMLElement>("a[href], button");
    if (target) {
      e.preventDefault();
      target.focus();
      target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  };

  if (!items.length) return null;

  return (
    <section aria-labelledby={headingId} className={cn("group/row relative py-4 md:py-6", className)}>
      <SectionHeading id={headingId} title={title} subtitle={subtitle} href={href} className="gutter" />
      <div className="relative">
        <ul
          ref={scroller}
          role="list"
          onScroll={updateEdges}
          onKeyDown={onKeyDown}
          className="no-scrollbar scroll-px-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-2 pt-1.5 md:gap-4"
        >
          {items.map((item, i) => (
            <li key={getKey(item)} className={cn("shrink-0 snap-start", itemClassName)}>
              {renderItem(item, i)}
            </li>
          ))}
        </ul>

        <RailArrow dir={-1} hidden={edges.start} onClick={() => page(-1)} label={`Scroll ${title} back`} />
        <RailArrow dir={1} hidden={edges.end} onClick={() => page(1)} label={`Scroll ${title} forward`} />
      </div>
    </section>
  );
}

function RailArrow({ dir, hidden, onClick, label }: { dir: 1 | -1; hidden: boolean; onClick: () => void; label: string }) {
  const Icon = dir === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-0 z-30 hidden h-[calc(100%-3.25rem)] w-[calc(var(--gutter)-0.25rem)] items-center justify-center text-ink/80 transition-[opacity,color] duration-300 hover:text-ink [@media(hover:hover)]:flex",
        dir === 1 ? "right-0 bg-gradient-to-l from-canvas/90 to-transparent" : "left-0 bg-gradient-to-r from-canvas/90 to-transparent",
        hidden ? "pointer-events-none opacity-0" : "opacity-0 group-hover/row:opacity-100",
      )}
    >
      <Icon className="size-7" strokeWidth={1.25} />
    </button>
  );
}
