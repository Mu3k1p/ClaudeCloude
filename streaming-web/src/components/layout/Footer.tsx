import Link from "next/link";
import { BrandMark } from "@/components/ui/Logo";
import { config } from "@/lib/config";

export function Footer() {
  return (
    <footer className="gutter mt-16 border-t border-line pb-28 pt-10 md:mt-24 md:pb-14">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-ink-muted">
            <BrandMark className="size-4 text-accent/80" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em]">{config.brandName}</span>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ink-faint">
            A personal media universe. Films, stories and photography, curated from Phnom Penh.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-muted">
            <li><Link className="hover:text-ink" href="/explore">Explore</Link></li>
            <li><Link className="hover:text-ink" href="/collections">Collections</Link></li>
            <li><Link className="hover:text-ink" href="/library">Library</Link></li>
            <li><Link className="hover:text-ink" href="/profile">Account</Link></li>
          </ul>
        </nav>
      </div>
      <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
        © {new Date().getFullYear()} {config.brandName} · ភ្នំពេញ
      </p>
    </footer>
  );
}
