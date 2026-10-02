import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-[4px] bg-elevated bg-[linear-gradient(100deg,transparent_20%,rgb(237_232_223/0.045)_50%,transparent_80%)] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}

/** Skeleton for a horizontal rail. */
export function RailSkeleton({ aspect = "aspect-[2/3]", count = 7, width = "w-[38vw] sm:w-[26vw] md:w-[19vw] lg:w-[14.5vw]" }: { aspect?: string; count?: number; width?: string }) {
  return (
    <div className="py-5" role="status" aria-label="Loading">
      <Skeleton className="mb-4 ml-[var(--gutter)] h-4 w-44" />
      <div className="flex gap-3 overflow-hidden pl-[var(--gutter)] md:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className={cn("shrink-0", aspect, width)} />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12, aspect = "aspect-[2/3]" }: { count?: number; aspect?: string }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={aspect} />
      ))}
    </div>
  );
}
