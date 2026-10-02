"use client";

import Link from "next/link";
import { memo } from "react";
import { Play } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { formatRuntime, kindLabel, remainingLabel } from "@/lib/format";
import type { CardVariant, Content } from "@/lib/types";
import { ASPECT, SIZES, variantFor } from "./cardVariants";
import { MyListButton } from "./MyListButton";

export interface ContentCardProps {
  item: Content;
  variant?: CardVariant;
  /** Show 01, 02... before the title (ranked rails). */
  rank?: number;
  /** Continue-watching treatment: progress bar, time left, play goes straight to the player. */
  showProgress?: boolean;
  className?: string;
  priority?: boolean;
}

function pickImage(item: Content, variant: CardVariant) {
  if (variant === "poster" || variant === "portrait") return item.poster ?? item.thumbnail ?? item.backdrop;
  return item.thumbnail ?? item.backdrop ?? item.poster;
}

/**
 * The core card. Navigation is a full-cover link; action buttons sit above it
 * (never nested inside the link, which would be invalid HTML).
 */
export const ContentCard = memo(function ContentCard({
  item,
  variant: variantProp,
  rank,
  showProgress,
  className,
  priority,
}: ContentCardProps) {
  const variant = variantProp ?? variantFor(item.kind);
  const href = `/title/${encodeURIComponent(item.id)}`;
  const watchHref = `/watch/${encodeURIComponent(item.id)}`;
  const remaining = showProgress ? remainingLabel(item) : undefined;
  const meta = [
    item.year,
    item.kind === "series" && item.seasons ? `${item.seasons} season${item.seasons > 1 ? "s" : ""}` : formatRuntime(item.runtimeMinutes),
    kindLabel(item.kind),
  ].filter(Boolean);

  return (
    <article className={cn("group/card relative", className)}>
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-[5px] bg-elevated ring-1 ring-inset ring-line [container-type:inline-size]",
          "transition-transform duration-500 ease-[var(--ease-cinema)] [@media(hover:hover)]:group-hover/card:-translate-y-1 [@media(hover:hover)]:group-hover/card:scale-[1.025]",
          ASPECT[variant],
        )}
      >
        <Artwork
          src={pickImage(item, variant)}
          alt=""
          title={item.title}
          sizes={SIZES[variant]}
          priority={priority}
          imgClassName="brightness-[0.88] [@media(hover:hover)]:group-hover/card:brightness-[1.04] group-focus-within/card:brightness-[1.04]"
        />

        {item.isNew && !showProgress && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-[3px] bg-canvas/70 px-1.5 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.16em] text-accent backdrop-blur-[2px]">
            New
          </span>
        )}

        {/* Hover layer: synopsis + actions. Hidden on touch devices, where the card simply navigates. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-500 ease-[var(--ease-cinema)] md:p-3.5",
            "[@media(hover:hover)]:group-hover/card:opacity-100 group-focus-within/card:opacity-100",
          )}
        >
          {variant !== "poster" && variant !== "portrait" && item.synopsis && (
            <p className="mb-3 line-clamp-2 max-w-[44ch] translate-y-1 text-[12.5px] leading-snug text-ink-soft transition-transform duration-500 group-hover/card:translate-y-0">
              {item.synopsis}
            </p>
          )}
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              href={watchHref}
              aria-label={`Play ${item.title}`}
              className="inline-flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-accent-strong"
            >
              <Play className="ml-0.5 size-4" fill="currentColor" strokeWidth={0} />
            </Link>
            <MyListButton item={item} appearance="icon" size="sm" className="size-9 bg-black/30 backdrop-blur-[2px]" />
          </div>
        </div>

        {showProgress && item.progress != null && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2.5 pb-2.5">
            <ProgressBar value={item.progress} label={`${Math.round(item.progress * 100)}% watched`} />
          </div>
        )}

        <Link data-card-link href={showProgress ? watchHref : href} className="absolute inset-0 z-0 rounded-[5px] focus-visible:outline-offset-[-2px]">
          <span className="sr-only">
            {showProgress ? `Resume ${item.title}` : item.title}
            {meta.length ? `, ${meta.join(", ")}` : ""}
          </span>
        </Link>
      </div>

      <div className="mt-2.5 flex gap-2.5 pr-1" aria-hidden>
        {rank != null && (
          <span className="font-mono text-[13px] leading-[1.35] text-accent/80 tabular">{String(rank).padStart(2, "0")}</span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] font-medium leading-[1.35] tracking-[-0.005em] text-ink-soft transition-colors duration-300 group-hover/card:text-ink">
            {item.title}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-ink-faint tabular">{remaining ?? meta.join(" · ")}</p>
        </div>
      </div>
    </article>
  );
});
