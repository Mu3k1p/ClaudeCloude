"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { MOBILE_NAV, isActive } from "./nav";

/** Bottom tab bar on small screens. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-[60px] flex-col items-center justify-center gap-1 text-[10.5px] tracking-wide transition-colors", active ? "text-ink" : "text-ink-faint")}
              >
                <Icon className={cn("size-[21px]", active && "text-accent")} strokeWidth={active ? 1.75 : 1.4} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
