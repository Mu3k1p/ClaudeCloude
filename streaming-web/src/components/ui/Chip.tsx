import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const cls = (active?: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] transition-colors duration-300",
    active
      ? "border-accent/60 bg-accent-soft text-accent-strong"
      : "border-line text-ink-soft hover:border-line-strong hover:text-ink",
  );

export function Chip({
  active,
  href,
  onClick,
  children,
  replace,
}: {
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  replace?: boolean;
}) {
  if (href)
    return (
      <Link href={href} replace={replace} scroll={false} aria-current={active ? "true" : undefined} className={cls(active)}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls(active)}>
      {children}
    </button>
  );
}
