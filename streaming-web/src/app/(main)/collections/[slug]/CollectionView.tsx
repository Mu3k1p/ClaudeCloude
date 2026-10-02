"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Bookmark, BookmarkCheck, Play } from "lucide-react";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSavedCollections } from "@/hooks/useLibrary";
import { qk } from "@/lib/queryKeys";
import { collectionsService } from "@/services";

export function CollectionView({ slug }: { slug: string }) {
  const q = useQuery({ queryKey: qk.collection(slug), queryFn: () => collectionsService.detail(slug) });
  const saved = useSavedCollections();
  useDocumentTitle(q.data?.title);

  if (q.isError)
    return (
      <div className="gutter pt-32">
        <ErrorState error={q.error} onRetry={() => q.refetch()} title="This collection isn't available" />
      </div>
    );

  const c = q.data;
  const isSaved = c ? saved.isSaved(c.id) : false;
  const first = c?.items?.[0];

  return (
    <div>
      <div className="relative isolate h-[62svh] min-h-[440px] overflow-hidden md:h-[72svh]">
        {c ? (
          <motion.div className="absolute inset-0 -z-10" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
            <Artwork src={c.image} alt="" title={c.title} sizes="100vw" priority quality={85} imgClassName="brightness-[0.7]" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 -z-10 bg-surface" />
        )}
        <div className="scrim-bottom absolute inset-0 -z-[5]" />
        <div className="grain absolute inset-0 -z-[5]" />
        <div className="gutter flex h-full flex-col justify-end pb-10 md:pb-16">
          {c ? (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
              <p className="eyebrow flex flex-wrap items-center gap-3">
                <span className="inline-block h-px w-6 bg-accent" aria-hidden />
                <span className="text-accent/90">{c.subtitle ?? "Collection"}</span>
                {c.curator && <span>Curated by {c.curator}</span>}
              </p>
              <h1 className="display mt-4 text-balance text-[clamp(2.5rem,6.5vw,5.5rem)]">{c.title}</h1>
              {c.description && <p className="mt-5 max-w-[56ch] text-[15.5px] leading-relaxed text-ink-soft md:text-[17px]">{c.description}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {first && (
                  <Button href={`/watch/${encodeURIComponent(first.id)}`} variant="primary" size="lg" icon={<Play fill="currentColor" strokeWidth={0} />}>
                    Start with {first.title}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  aria-pressed={isSaved}
                  onClick={() => saved.toggle(c)}
                  icon={isSaved ? <BookmarkCheck strokeWidth={1.5} className="text-accent" /> : <Bookmark strokeWidth={1.5} />}
                >
                  {isSaved ? "Saved" : "Save collection"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-16 w-[min(520px,80%)]" />
              <Skeleton className="h-4 w-[min(480px,70%)]" />
            </div>
          )}
        </div>
      </div>

      <section aria-label="Titles in this collection" className="gutter mt-10 md:mt-14">
        {!c ? (
          <GridSkeleton />
        ) : c.items?.length ? (
          <>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint tabular">{String(c.items.length).padStart(2, "0")} titles</p>
            <ContentGrid items={c.items} variant="poster" />
          </>
        ) : (
          <EmptyState title="This collection is being curated" message="Check back soon." />
        )}
      </section>
    </div>
  );
}
