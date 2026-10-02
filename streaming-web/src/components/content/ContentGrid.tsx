import { cn } from "@/lib/cn";
import type { CardVariant, Content } from "@/lib/types";
import { ContentCard } from "./ContentCard";

const COLS: Record<CardVariant, string> = {
  poster: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  portrait: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  square: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  landscape: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  wide: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export function ContentGrid({
  items,
  variant = "poster",
  showProgress,
  className,
}: {
  items: Content[];
  variant?: CardVariant;
  showProgress?: boolean;
  className?: string;
}) {
  return (
    <ul role="list" className={cn("grid gap-x-3 gap-y-7 md:gap-x-4 md:gap-y-9", COLS[variant], className)}>
      {items.map((item, i) => (
        <li key={item.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
          <ContentCard item={item} variant={variant} showProgress={showProgress} />
        </li>
      ))}
    </ul>
  );
}
