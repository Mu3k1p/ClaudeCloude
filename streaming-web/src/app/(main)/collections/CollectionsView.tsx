"use client";

import { useQuery } from "@tanstack/react-query";
import { CollectionCard } from "@/components/content/CollectionCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { qk } from "@/lib/queryKeys";
import { collectionsService } from "@/services";

export function CollectionsView() {
  const q = useQuery({ queryKey: qk.collections, queryFn: collectionsService.list });
  const editorial = q.data?.filter((c) => c.editorial) ?? [];
  const rest = q.data?.filter((c) => !c.editorial) ?? [];

  return (
    <div className="gutter pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+4rem)]">
      <header className="max-w-2xl">
        <p className="eyebrow">Curated</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)]">Collections</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Hand-picked sets around a place, a craft or a feeling. Architecture, the coast, the night shift, the people building things.
        </p>
      </header>

      {q.isPending ? (
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10]" />
          ))}
        </div>
      ) : q.isError ? (
        <ErrorState className="mt-12" error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          {editorial.length > 0 && (
            <section aria-label="Editorial collections" className="mt-12 md:mt-16">
              <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
                {editorial.map((c) => (
                  <li key={c.id} className="animate-fade-up">
                    <CollectionCard collection={c} size="lg" />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {rest.length > 0 && (
            <section aria-labelledby="all-collections" className="mt-14 md:mt-20">
              <h2 id="all-collections" className="mb-6 text-xl font-medium tracking-tight">All collections</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
                {rest.map((c, i) => (
                  <li key={c.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <CollectionCard collection={c} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
