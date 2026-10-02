import Link from "next/link";
import { cn } from "@/lib/cn";
import { config } from "@/lib/config";

/**
 * Brand mark: four petals of the rumdul (Cambodia's national flower),
 * reduced to a geometric figure. Paired with a spaced wordmark.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2.5c2.2 2.4 2.2 5.6 0 8-2.2-2.4-2.2-5.6 0-8Z" />
        <path d="M21.5 12c-2.4 2.2-5.6 2.2-8 0 2.4-2.2 5.6-2.2 8 0Z" />
        <path d="M12 21.5c-2.2-2.4-2.2-5.6 0-8 2.2 2.4 2.2 5.6 0 8Z" />
        <path d="M2.5 12c2.4-2.2 5.6-2.2 8 0-2.4 2.2-5.6 2.2-8 0Z" />
      </g>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label={`${config.brandName}, home`} className={cn("group inline-flex items-center gap-2.5", className)}>
      <BrandMark className="text-accent transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:rotate-45" />
      <span className="font-mono text-[13px] font-medium uppercase tracking-[0.32em] text-ink">{config.brandName}</span>
    </Link>
  );
}
