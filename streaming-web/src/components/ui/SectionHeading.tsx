import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  title,
  subtitle,
  href,
  id,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4 md:mb-5", className)}>
      <div>
        <h2 id={id} className="text-[17px] font-medium tracking-[-0.015em] text-ink md:text-xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
        >
          View all
          <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={1.75} />
          <span className="sr-only">: {title}</span>
        </Link>
      )}
    </div>
  );
}
