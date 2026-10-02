"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/Logo";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="gutter flex min-h-dvh flex-col items-start justify-center">
      <BrandMark className="mb-8 size-7 text-accent" />
      <p className="eyebrow">Interrupted</p>
      <h1 className="display mt-4 text-[clamp(2.25rem,5vw,4rem)]">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-ink-muted">An unexpected error stopped this page from loading. Try again, or head back home.</p>
      <div className="mt-10 flex gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          Try again
        </Button>
        <Button href="/" variant="ghost" size="lg">
          Home
        </Button>
      </div>
    </main>
  );
}
