"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import type { Collection, Content } from "@/lib/types";
import { kindLabel } from "@/lib/format";

/**
 * Large editorial block for curated stories (e.g. Phnom Penh After Dark).
 * Magazine-like: big image, restrained copy, a short index of titles.
 */
export function EditorialFeature({ collection, items }: { collection: Collection; items: Content[] }) {
  const list = (items.length ? items : collection.items ?? []).slice(0, 4);
  const href = `/collections/${encodeURIComponent(collection.slug)}`;

  return (
    <section aria-labelledby={`ed-${collection.id}`} className="gutter py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="grid overflow-hidden rounded-md border border-line bg-surface lg:grid-cols-[1.55fr_1fr]"
      >
        <Link href={href} className="group/ed relative block aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[520px]" tabIndex={-1} aria-hidden>
          <Artwork
            src={collection.image}
            alt=""
            title={collection.title}
            sizes="(min-width:1024px) 60vw, 100vw"
            imgClassName="brightness-[0.8] transition-[transform,filter] duration-[1600ms] ease-[var(--ease-cinema)] group-hover/ed:scale-[1.03] group-hover/ed:brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:bg-gradient-to-l" />
        </Link>

        <div className="flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10 xl:p-12">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="text-accent">{collection.subtitle ?? "Editorial"}</span>
              {collection.curator && <span>Curated by {collection.curator}</span>}
            </p>
            <h2 id={`ed-${collection.id}`} className="display mt-5 text-balance text-[clamp(2rem,4vw,3.4rem)] text-ink">
              {collection.title}
            </h2>
            {collection.description && <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">{collection.description}</p>}
          </div>

          {list.length > 0 && (
            <ol className="divide-y divide-line border-y border-line">
              {list.map((c, i) => (
                <li key={c.id}>
                  <Link href={`/title/${encodeURIComponent(c.id)}`} className="group/li flex items-center gap-4 py-3.5">
                    <span className="font-mono text-[12px] text-ink-faint tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] text-ink-soft transition-colors group-hover/li:text-ink">{c.title}</span>
                      <span className="block text-[12px] text-ink-faint">{[kindLabel(c.kind), c.year].filter(Boolean).join(" · ")}</span>
                    </span>
                    <ArrowRight aria-hidden className="size-4 -translate-x-1 text-accent opacity-0 transition-[opacity,transform] duration-300 group-hover/li:translate-x-0 group-hover/li:opacity-100" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <div>
            <Button href={href} variant="outline" size="md">
              Explore the collection
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
