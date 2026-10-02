"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BrandMark } from "@/components/ui/Logo";
import { useAuth } from "@/providers/AuthProvider";

export function FullscreenLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="fixed inset-0 z-[90] flex items-center justify-center bg-canvas">
      <BrandMark className="size-8 animate-[spin_6s_linear_infinite] text-accent/80" />
    </div>
  );
}

/** Client-side guard: signed-in users only; multi-profile accounts must pick a profile. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, needsProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (needsProfile) router.replace(`/profiles?next=${encodeURIComponent(pathname)}`);
  }, [status, needsProfile, router, pathname]);

  if (status !== "authenticated" || needsProfile) return <FullscreenLoader />;
  return <>{children}</>;
}
