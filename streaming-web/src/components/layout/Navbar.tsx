"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, isActive } from "./nav";
import { ProfileMenu } from "./ProfileMenu";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" jumps to search from anywhere, unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      router.push("/search");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-cinema)]",
        scrolled ? "border-b border-line bg-canvas/88 backdrop-blur-md" : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-ink">
        Skip to content
      </a>
      <div className="gutter flex h-[var(--nav-h)] items-center gap-10">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-2 text-[13.5px] tracking-[-0.005em] transition-colors duration-300",
                      active ? "text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-accent transition-opacity duration-300",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:gap-3">
          <Link
            href="/search"
            aria-label="Search (press /)"
            className={cn(
              "hidden h-9 items-center gap-2.5 rounded-full border px-3.5 text-[13px] transition-colors duration-300 md:inline-flex",
              pathname === "/search" ? "border-accent/50 text-ink" : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            <Search className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded border border-line px-1.5 font-mono text-[10px] text-ink-faint lg:inline">/</kbd>
          </Link>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
