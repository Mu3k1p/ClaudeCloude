"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/providers/AuthProvider";
import { config } from "@/lib/config";

// Purely decorative backdrop for the sign-in screen. Swap for a brand asset in /public.
const BACKDROP = "https://picsum.photos/seed/rd-login-phnompenh/1920/1200";

export function LoginView() {
  const { login, status, needsProfile } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(needsProfile ? `/profiles?next=${encodeURIComponent(next)}` : next);
  }, [status, needsProfile, next, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(false);
    }
  };

  const field =
    "peer h-12 w-full rounded-[5px] border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-faint transition-colors focus:border-accent/60 focus:outline-none";

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.25fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block" aria-hidden>
        <Artwork src={BACKDROP} alt="" sizes="60vw" priority imgClassName="brightness-[0.55]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-canvas" />
        <div className="grain absolute inset-0" />
        <div className="absolute bottom-14 left-14 max-w-md">
          <p className="eyebrow text-ink-soft/70">Tonight</p>
          <p className="display mt-4 text-5xl text-ink">Stories from a city that never quite sleeps.</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="my-auto w-full max-w-sm py-16"
        >
          <h1 className="display text-4xl text-ink md:text-[2.75rem]">Welcome back.</h1>
          <p className="mt-3 text-[15px] text-ink-muted">Sign in to continue to {config.brandName}.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] text-ink-soft">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-[13px] text-ink-soft">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} placeholder="••••••••" />
            </div>
            {error && (
              <p role="alert" className="text-[13px] text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-2 w-full">
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight strokeWidth={1.75} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />}
            </Button>
          </form>

          {config.useMocks && (
            <p className="mt-8 rounded-[5px] border border-dashed border-line px-4 py-3 text-[12.5px] leading-relaxed text-ink-faint">
              Development mode: mock API is on. Any email and a password of 4+ characters will sign you in.
            </p>
          )}
        </motion.div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">ភ្នំពេញ · Phnom Penh</p>
      </div>
    </main>
  );
}
