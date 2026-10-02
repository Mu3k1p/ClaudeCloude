"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { ContentRail } from "@/components/content/RailRenderer";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { qk } from "@/lib/queryKeys";
import { recommendationsService, searchService } from "@/services";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(params.get("q") ?? "");
  const q = useDebouncedValue(value.trim(), 280);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the query in the URL so results are shareable and survive back/forward.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (current === q) return;
    router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });
  }, [q, params, pathname, router]);

  const trending = useQuery({ queryKey: qk.trending, queryFn: searchService.trending, staleTime: 5 * 60_000 });
  const suggestions = useQuery({ queryKey: qk.recommendations, queryFn: recommendationsService.forYou, enabled: !q });
  const results = useQuery({
    queryKey: qk.search(q),
    queryFn: ({ signal }) => searchService.query(q, signal),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
  });

  const r = results.data;
  const count = r ? r.movies.length + r.series.length + r.other.length + r.people.length + r.collections.length : 0;

  return (
    <div className="pt-[calc(var(--nav-h)+2rem)] md:pt-[calc(var(--nav-h)+4rem)]">
      <div className="gutter">
        <SearchBar ref={inputRef} value={value} onChange={setValue} loading={results.isFetching} />

        {/* Trending searches */}
        {!q && trending.data && trending.data.length > 0 && (
          <section aria-labelledby="trending-searches" className="mt-10">
            <h2 id="trending-searches" className="eyebrow flex items-center gap-2">
              <TrendingUp className="size-3.5" strokeWidth={1.75} aria-hidden /> Trending searches
            </h2>
            <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
              {trending.data.map((t, i) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => setValue(t)}
                    className="group flex w-full items-center gap-4 border-b border-line py-3.5 text-left text-[15px] text-ink-soft transition-colors hover:text-ink"
                  >
                    <span className="font-mono text-[11px] text-ink-faint tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{t}</span>
                    <ArrowUpRight className="size-4 text-ink-faint transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-accent" strokeWidth={1.5} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {!q && suggestions.data && suggestions.data.length > 0 && (
        <div className="mt-12">
          <ContentRail title="Suggested for you" items={suggestions.data} variant="landscape" />
        </div>
      )}

      {q && (
        <div className="gutter mt-10" aria-live="polite" aria-busy={results.isFetching}>
          {q.length < 2 ? (
            <p className="text-sm text-ink-muted">Keep typing…</p>
          ) : results.isPending ? (
            <GridSkeleton count={6} />
          ) : results.isError ? (
            <ErrorState error={results.error} onRetry={() => results.refetch()} title="Search is unavailable right now" />
          ) : count === 0 ? (
            <EmptyState title={`No results for “${q}”`} message="Try a title, a person, a place like Kampot, or a mood like nightlife." />
          ) : (
            <>
              <p className="mb-10 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint tabular">
                {count} result{count === 1 ? "" : "s"} for “{q}”
              </p>
              <SearchResults results={r!} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
