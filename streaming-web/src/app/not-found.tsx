import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-dvh flex-col items-start justify-center">
      <BrandMark className="mb-8 size-7 text-accent" />
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">This reel is missing.</h1>
      <p className="mt-4 max-w-md text-ink-muted">The page you were looking for doesn&apos;t exist, or it&apos;s been moved.</p>
      <Button href="/" variant="primary" size="lg" className="mt-10">
        Back to home
      </Button>
    </main>
  );
}
