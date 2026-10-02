"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { ContentRail } from "@/components/content/RailRenderer";
import { MetaLine } from "@/components/content/MetaLine";
import { MyListButton } from "@/components/content/MyListButton";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { metaParts } from "@/lib/format";
import { qk } from "@/lib/queryKeys";
import { contentService, profileService, progressService } from "@/services";

export function WatchView({ id }: { id: string }) {
  const qc = useQueryClient();
  const detail = useQuery({ queryKey: qk.content(id), queryFn: () => contentService.detail(id) });
  // Playback URLs are often signed and short-lived: always fetch fresh.
  const playback = useQuery({ queryKey: qk.playback(id), queryFn: () => contentService.playback(id), staleTime: 0, gcTime: 0 });
  const related = useQuery({ queryKey: qk.related(id), queryFn: () => contentService.related(id) });
  const prefs = useQuery({ queryKey: qk.preferences, queryFn: profileService.preferences });
  useDocumentTitle(detail.data ? `Watching ${detail.data.title}` : undefined);

  const onProgress = useCallback(
    (position: number, duration: number) => {
      progressService
        .save(id, position, duration)
        .then(() => {
          qc.invalidateQueries({ queryKey: qk.progress });
          qc.invalidateQueries({ queryKey: qk.history });
          qc.invalidateQueries({ queryKey: qk.content(id) });
        })
        .catch(() => {
          /* Progress is best-effort; never interrupt playback for it. */
        });
    },
    [id, qc],
  );

  const backHref = `/title/${encodeURIComponent(id)}`;
  const error = detail.error ?? playback.error;

  return (
    <div className="min-h-dvh bg-canvas">
      {error ? (
        <div className="gutter flex min-h-[60svh] flex-col justify-center gap-8">
          <Logo />
          <ErrorState error={error} title="We couldn't start playback" onRetry={() => (detail.refetch(), playback.refetch())} />
        </div>
      ) : !detail.data || !playback.data ? (
        <div className="relative aspect-video max-h-[100svh] w-full bg-black" role="status" aria-label="Loading player">
          <div className="absolute inset-0 animate-pulse bg-surface/40" />
        </div>
      ) : (
        <VideoPlayer
          key={id}
          content={detail.data}
          playback={playback.data}
          backHref={backHref}
          onProgress={onProgress}
          autoplayNext={prefs.data?.autoplayNext ?? true}
          defaultSubtitle={prefs.data?.subtitleLanguage}
        />
      )}

      {/* Below the player */}
      <div className="gutter py-10 md:py-14">
        {detail.data ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
            <div className="max-w-3xl">
              <h1 className="display text-[clamp(1.9rem,4vw,3.25rem)] text-ink">{detail.data.title}</h1>
              <MetaLine className="mt-4" parts={[...metaParts(detail.data), detail.data.genres.map((g) => g.name).join(", ")]} />
              {detail.data.synopsis && <p className="mt-5 max-w-[64ch] text-[15.5px] leading-relaxed text-ink-soft">{detail.data.synopsis}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              <MyListButton item={detail.data} size="md" />
              <Button href={backHref} variant="ghost" size="md" icon={<Info strokeWidth={1.5} />}>
                Details
              </Button>
            </div>
          </div>
        ) : (
          !error && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-[min(600px,90%)]" />
            </div>
          )
        )}
      </div>

      {related.data && related.data.length > 0 && (
        <div className="pb-16">
          <ContentRail title="Related" items={related.data} variant="landscape" />
        </div>
      )}
    </div>
  );
}
