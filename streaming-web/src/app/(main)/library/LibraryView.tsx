"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Clock, History, Layers } from "lucide-react";
import { ContentGrid } from "@/components/content/ContentGrid";
import { CollectionCard } from "@/components/content/CollectionCard";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useContinueWatching, useMyList, useSavedCollections } from "@/hooks/useLibrary";
import { kindLabel, relativeDate } from "@/lib/format";
import { qk } from "@/lib/queryKeys";
import { libraryService } from "@/services";
import type { HistoryEntry } from "@/lib/types";

type TabKey = "list" | "continue" | "history" | "collections";

export function LibraryView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = (params.get("tab") as TabKey) || "list";

  const myList = useMyList();
  const cw = useContinueWatching();
  const saved = useSavedCollections();
  const history = useQuery({ queryKey: qk.history, queryFn: libraryService.history });

  const setTab = (k: TabKey) => router.replace(k === "list" ? pathname : `${pathname}?tab=${k}`, { scroll: false });

  return (
    <div className="gutter pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+4rem)]">
      <header className="mb-10 md:mb-14">
        <p className="eyebrow">Yours</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)]">Library</h1>
      </header>

      <Tabs<TabKey>
        label="Library sections"
        value={tab}
        onChange={setTab}
        items={[
          { key: "list", label: "My List", count: myList.data?.length },
          { key: "continue", label: "Continue Watching", count: cw.data?.length },
          { key: "history", label: "History", count: history.data?.length },
          { key: "collections", label: "Saved Collections", count: saved.data?.length },
        ]}
      >
        <div className="pt-8 md:pt-10">
          {tab === "list" &&
            (myList.isPending ? (
              <GridSkeleton />
            ) : myList.isError ? (
              <ErrorState error={myList.error} onRetry={() => myList.refetch()} />
            ) : myList.data.length === 0 ? (
              <EmptyState
                icon={<Bookmark strokeWidth={1.25} />}
                title="Your list is empty"
                message="Save films, series and photo essays to watch later. They'll wait for you here."
                action={<Button href="/explore" variant="outline" size="sm">Explore titles</Button>}
              />
            ) : (
              <ContentGrid items={myList.data} variant="poster" />
            ))}

          {tab === "continue" &&
            (cw.isPending ? (
              <GridSkeleton aspect="aspect-video" count={6} />
            ) : cw.isError ? (
              <ErrorState error={cw.error} onRetry={() => cw.refetch()} />
            ) : cw.data.length === 0 ? (
              <EmptyState icon={<Clock strokeWidth={1.25} />} title="Nothing in progress" message="Start something and it'll show up here so you can pick up where you left off." />
            ) : (
              <ContentGrid items={cw.data} variant="landscape" showProgress />
            ))}

          {tab === "history" &&
            (history.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : history.isError ? (
              <ErrorState error={history.error} onRetry={() => history.refetch()} />
            ) : history.data.length === 0 ? (
              <EmptyState icon={<History strokeWidth={1.25} />} title="No watch history yet" message="Everything you watch will be listed here." />
            ) : (
              <HistoryList entries={history.data} />
            ))}

          {tab === "collections" &&
            (saved.isPending ? (
              <GridSkeleton aspect="aspect-[16/10]" count={3} />
            ) : saved.isError ? (
              <ErrorState error={saved.error} onRetry={() => saved.refetch()} />
            ) : saved.data.length === 0 ? (
              <EmptyState
                icon={<Layers strokeWidth={1.25} />}
                title="No saved collections"
                message="Save curated collections to keep them close."
                action={<Button href="/collections" variant="outline" size="sm">Browse collections</Button>}
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.data.map((c) => (
                  <li key={c.id}>
                    <CollectionCard collection={c} />
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </Tabs>
    </div>
  );
}

function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {entries.map(({ content: c, watchedAt, progress }) => (
        <li key={`${c.id}-${watchedAt}`}>
          <Link href={`/title/${encodeURIComponent(c.id)}`} className="group flex items-center gap-4 py-4 md:gap-6">
            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-inset ring-line md:w-40">
              <Artwork src={c.thumbnail ?? c.backdrop} alt="" title={c.title} sizes="160px" imgClassName="brightness-90 group-hover:brightness-105" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-ink-soft transition-colors group-hover:text-ink">{c.title}</p>
              <p className="mt-1 text-[12.5px] text-ink-faint">
                {kindLabel(c.kind)}
                {c.year ? ` · ${c.year}` : ""}
              </p>
              <ProgressBar value={progress} className="mt-3 max-w-[200px]" />
            </div>
            <p className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint sm:block">
              {progress >= 0.95 ? "Finished" : `${Math.round(progress * 100)}%`} · {relativeDate(watchedAt)}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
