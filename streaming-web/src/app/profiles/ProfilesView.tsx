"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { Artwork } from "@/components/ui/Artwork";
import { BrandMark } from "@/components/ui/Logo";
import { FullscreenLoader } from "@/components/layout/AuthGate";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/cn";

export function ProfilesView() {
  const { status, profiles, activeProfile, selectProfile } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    // Single-profile (or profile-less) accounts have nothing to choose.
    if (status === "authenticated" && profiles.length <= 1) router.replace(next);
  }, [status, profiles.length, next, router]);

  if (status !== "authenticated" || profiles.length <= 1) return <FullscreenLoader />;

  return (
    <main className="gutter flex min-h-dvh flex-col items-center justify-center py-16">
      <BrandMark className="size-6 text-accent" />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="display mt-8 text-center text-[clamp(2rem,5vw,3.5rem)]"
      >
        Who&apos;s watching?
      </motion.h1>
      <ul className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10">
        {profiles.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={() => {
                selectProfile(p.id);
                router.replace(next);
              }}
              className="group flex w-28 flex-col items-center gap-4 md:w-36"
            >
              <span
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-md ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-[var(--ease-cinema)] group-hover:-translate-y-1 group-hover:ring-accent/70 group-focus-visible:ring-accent",
                  p.id === activeProfile?.id && "ring-accent/50",
                )}
              >
                <Artwork src={p.avatar} alt="" title={p.name} sizes="160px" imgClassName="brightness-90 group-hover:brightness-105" />
              </span>
              <span className="text-[14px] text-ink-muted transition-colors group-hover:text-ink">{p.name}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </main>
  );
}
