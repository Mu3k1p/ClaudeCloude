"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, LogOut, Settings, Users } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";

export function Avatar({ src, name, className, square }: { src?: string; name: string; className?: string; square?: boolean }) {
  return (
    <span className={cn("relative block overflow-hidden ring-1 ring-line-strong", square ? "rounded-md" : "rounded-full", className)}>
      <Artwork src={src} alt="" title={name.slice(0, 1)} sizes="64px" />
    </span>
  );
}

export function ProfileMenu() {
  const { user, profiles, activeProfile, selectProfile, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    // Move focus into the menu.
    requestAnimationFrame(() => wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onMenuKey = (e: KeyboardEvent) => {
    const items = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const name = activeProfile?.name ?? user?.name ?? "Account";
  const avatar = activeProfile?.avatar ?? user?.avatar;
  const itemCls = "flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-[13.5px] text-ink-soft outline-none transition-colors hover:bg-ink/[0.06] hover:text-ink focus-visible:bg-ink/[0.06] focus-visible:text-ink focus-visible:outline-none";

  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 rounded-full p-1 pr-1.5"
      >
        <Avatar src={avatar} name={name} className="size-8" />
        <ChevronDown aria-hidden className={cn("hidden size-3.5 text-ink-muted transition-transform duration-300 md:block", open && "rotate-180")} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Account"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] w-64 origin-top-right rounded-md border border-line bg-elevated p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
          >
            <div className="px-3 pb-3 pt-2.5">
              <p className="truncate text-sm font-medium text-ink">{name}</p>
              {user?.email && <p className="truncate text-[12px] text-ink-faint">{user.email}</p>}
            </div>

            {profiles.length > 1 && (
              <div className="border-t border-line py-1.5">
                <p className="eyebrow px-3 pb-1.5 pt-1 text-[10px]">Profiles</p>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      selectProfile(p.id);
                      setOpen(false);
                      router.push("/");
                    }}
                    className={itemCls}
                  >
                    <Avatar src={p.avatar} name={p.name} className="size-6" />
                    <span className="flex-1 truncate">{p.name}</span>
                    {p.id === activeProfile?.id && <Check className="size-3.5 text-accent" strokeWidth={2} aria-label="Active" />}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-1.5">
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className={itemCls}>
                <Settings className="size-4" strokeWidth={1.5} aria-hidden /> Profile & settings
              </Link>
              {profiles.length > 1 && (
                <Link role="menuitem" href="/profiles" onClick={() => setOpen(false)} className={itemCls}>
                  <Users className="size-4" strokeWidth={1.5} aria-hidden /> Manage profiles
                </Link>
              )}
              <button
                role="menuitem"
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  router.replace("/login");
                }}
                className={itemCls}
              >
                <LogOut className="size-4" strokeWidth={1.5} aria-hidden /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
