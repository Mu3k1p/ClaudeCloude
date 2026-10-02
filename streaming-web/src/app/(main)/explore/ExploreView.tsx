"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { qk } from "@/lib/queryKeys";
import { contentService } from "@/services";
import type { BrowseFilters, CardVariant, ContentKind } from "@/lib/types";

const KINDS: { value?: ContentKind; label: string }[] = [
  { label: "All" },
  { value: "movie", label: "Films" },
  { value: "series", label: "Series" },
  { value: "documentary", label: "Documentaries" },
  { value: "short", label: "Shorts" },
  { value: "photography", label: "Photography" },
  { value: "event", label: "Events" },
];

const SORTS: { value: NonNullable<BrowseFilters["sort"]>; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "score", label: "Highest rated" },
  { value: "az", label: "A–Z" },
];

const VARIANT_FOR_KIND: Partial<Record<ContentKind, CardVariant>> = { short: "landscape", event: "landscape", photography: "portrait" };

export function ExploreView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: BrowseFilters = {
    kind: (params.get("kind") as ContentKind) || undefined,
    genre: params.get("genre") || undefined,
    category: params.get("category") || undefined,
    sort: (params.get("sort") as BrowseFilters["sort"]) || "trending",
  };

  const hrefWith = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const categories = useQuery({ queryKey: qk.categories, queryFn: contentService.categories });
  const genres = useQuery({ queryKey: qk.genres, queryFn: contentService.genres });
  const results = useInfiniteQuery({
    queryKey: qk.browse(filters),
    queryFn: ({ pageParam }) => contentService.browse({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = results.data?.pages.flatMap((p) => p.items) ?? [];
  const total = results.data?.pages[0]?.total;
  const variant = (filters.kind && VARIANT_FOR_KIND[filters.kind]) || "poster";
  const isFiltered = !!(filters.kind || filters.genre || filters.category);

  return (
    <div className="pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+4rem)]">
      <header className="gutter">
        <p className="eyebrow">Browse</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)]">Explore</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Films, series, documentaries and photo essays. Filter by format, genre or mood.
        </p>
      </header>

      {/* Categories */}
      {!isFiltered && (
        <section aria-label="Categories" className="mt-10 md:mt-14">
          <ul className="no-scrollbar scroll-px-gutter flex snap-x gap-3 overflow-x-auto px-[var(--gutter)] md:grid md:grid-cols-3 md:gap-4 md:overflow-visible lg:grid-cols-6">
            {categories.isPending
              ? Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="w-[42vw] shrink-0 md:w-auto">
                    <Skeleton className="aspect-[4/5]" />
                  </li>
                ))
              : categories.data?.map((c, i) => (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="w-[42vw] shrink-0 snap-start md:w-auto"
                  >
                    <Link href={hrefWith({ category: c.slug })} className="group/cat relative block aspect-[4/5] overflow-hidden rounded-[5px] ring-1 ring-inset ring-line">
                      <Artwork src={c.image} alt="" title={c.name} sizes="(min-width:1024px) 16vw, 42vw" imgClassName="brightness-[0.55] transition-[transform,filter] duration-[1200ms] group-hover/cat:scale-105 group-hover/cat:brightness-[0.7]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[15px] font-medium text-ink">{c.name}</p>
                        {c.description && <p className="mt-1 line-clamp-2 text-[12px] text-ink-muted">{c.description}</p>}
                      </div>
                    </Link>
                  </motion.li>
                ))}
          </ul>
        </section>
      )}

      {/* Filters */}
      <div className="sticky top-[var(--nav-h)] z-30 mt-10 border-y border-line bg-canvas/90 backdrop-blur-md md:mt-14">
        <div className="gutter flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Format" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {KINDS.map((k) => {
              const active = filters.kind === k.value && !filters.category;
              return (
                <Link
                  key={k.label}
                  aria-current={active ? "page" : undefined}
                  href={hrefWith({ kind: k.value, category: undefined })}
                  replace
                  scroll={false}
                  className={cn(
                    "relative shrink-0 rounded px-3 py-2 text-[13.5px] transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {k.label}
                  {active && <motion.span layoutId="kind-underline" className="absolute inset-x-3 -bottom-[13px] h-px bg-accent" />}
                </Link>
              );
            })}
          </nav>
          <label className="flex items-center gap-3 text-[13px] text-ink-muted">
            Sort
            <select
              value={filters.sort}
              onChange={(e) => router.replace(hrefWith({ sort: e.target.value === "trending" ? undefined : e.target.value }), { scroll: false })}
              className="h-9 rounded-[5px] border border-line bg-surface px-3 pr-8 text-[13px] text-ink focus:border-accent/60 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Genres */}
      <div className="gutter mt-6">
        <ul aria-label="Genres" className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] md:flex-wrap">
          <li>
            <Chip href={hrefWith({ genre: undefined })} replace active={!filters.genre}>
              All genres
            </Chip>
          </li>
          {genres.data?.map((g) => (
            <li key={g.id}>
              <Chip href={hrefWith({ genre: filters.genre === g.slug ? undefined : g.slug })} replace active={filters.genre === g.slug}>
                {g.name}
              </Chip>
            </li>
          ))}
        </ul>
      </div>

      {/* Results */}
      <section aria-label="Results" aria-busy={results.isFetching} className="gutter mt-10">
        {filters.category && categories.data && (
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-xl font-medium tracking-tight">{categories.data.find((c) => c.slug === filters.category)?.name ?? "Category"}</h2>
            <Link href={hrefWith({ category: undefined })} replace className="text-[12px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent">
              Clear
            </Link>
          </div>
        )}
        {total != null && !results.isPending && (
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint tabular" aria-live="polite">
            {total} {total === 1 ? "title" : "titles"}
          </p>
        )}

        {results.isPending ? (
          <GridSkeleton />
        ) : results.isError ? (
          <ErrorState error={results.error} onRetry={() => results.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            message="No titles match these filters. Try a different genre or format."
            action={
              <Button href="/explore" variant="outline" size="sm">
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            <ContentGrid items={items} variant={variant} />
            {results.hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" onClick={() => results.fetchNextPage()} disabled={results.isFetchingNextPage}>
                  {results.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
