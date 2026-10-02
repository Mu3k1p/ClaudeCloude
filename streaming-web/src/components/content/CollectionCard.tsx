import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import { cn } from "@/lib/cn";
import type { Collection } from "@/lib/types";

export function CollectionCard({ collection, className, size = "md" }: { collection: Collection; className?: string; size?: "md" | "lg" }) {
  return (
    <Link
      href={`/collections/${encodeURIComponent(collection.slug)}`}
      className={cn("group/col relative block overflow-hidden rounded-[5px] ring-1 ring-inset ring-line", size === "lg" ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-[16/10]", className)}
    >
      <Artwork
        src={collection.image}
        alt=""
        title={collection.title}
        sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 80vw"
        imgClassName="brightness-[0.62] transition-[transform,filter] duration-[1200ms] group-hover/col:scale-[1.04] group-hover/col:brightness-[0.75]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        {collection.subtitle && <p className="eyebrow mb-2 text-ink-soft/70">{collection.subtitle}</p>}
        <h3 className={cn("font-medium tracking-[-0.02em] text-ink", size === "lg" ? "text-2xl md:text-3xl" : "text-lg md:text-xl")}>{collection.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-muted">
          {collection.itemCount != null && <span className="font-mono tabular">{String(collection.itemCount).padStart(2, "0")} titles</span>}
          <span className="h-px flex-1 origin-left scale-x-0 bg-accent/60 transition-transform duration-700 ease-[var(--ease-cinema)] group-hover/col:scale-x-100" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
