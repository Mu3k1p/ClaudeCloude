"use client";

import { useQuery } from "@tanstack/react-query";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Artwork } from "@/components/ui/Artwork";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { qk } from "@/lib/queryKeys";
import { contentService } from "@/services";

export function PersonView({ id }: { id: string }) {
  const q = useQuery({ queryKey: qk.person(id), queryFn: () => contentService.person(id) });
  useDocumentTitle(q.data?.name);

  if (q.isError)
    return (
      <div className="gutter pt-32">
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      </div>
    );

  const p = q.data;
  return (
    <div className="gutter pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <header className="grid items-end gap-8 md:grid-cols-[220px_1fr] md:gap-12">
        <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-md ring-1 ring-line md:w-full">
          {p ? <Artwork src={p.image} alt={p.name} title={p.name} sizes="220px" priority /> : <Skeleton className="absolute inset-0" />}
        </div>
        <div className="max-w-2xl">
          {p ? (
            <>
              {p.role && <p className="eyebrow text-accent/90">{p.role}</p>}
              <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)]">{p.name}</h1>
              {p.bio && <p className="mt-5 text-[15.5px] leading-relaxed text-ink-soft">{p.bio}</p>}
            </>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-80" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
        </div>
      </header>

      <section aria-labelledby="known-for" className="mt-16 md:mt-24">
        <SectionHeading id="known-for" title="Known for" />
        {!p ? <GridSkeleton count={6} /> : p.knownFor?.length ? <ContentGrid items={p.knownFor} variant="poster" /> : <p className="text-sm text-ink-muted">No titles yet.</p>}
      </section>
    </div>
  );
}
