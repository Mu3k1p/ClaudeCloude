"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Clapperboard, Play, RotateCcw } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatRuntime, kindLabel, remainingLabel } from "@/lib/format";
import { qk } from "@/lib/queryKeys";
import { contentService } from "@/services";
import type { Content } from "@/lib/types";
import { ContentGrid } from "./ContentGrid";
import { MetaLine } from "./MetaLine";
import { MyListButton } from "./MyListButton";
import { PersonCard } from "./PersonCard";

const ease = [0.22, 1, 0.36, 1] as const;

export function ContentDetails({ id }: { id: string }) {
  const detail = useQuery({ queryKey: qk.content(id), queryFn: () => contentService.detail(id) });
  const related = useQuery({ queryKey: qk.related(id), queryFn: () => contentService.related(id) });
  const [trailerOpen, setTrailerOpen] = useState(false);
  useDocumentTitle(detail.data?.title);

  if (detail.isError) {
    return (
      <div className="gutter pt-32">
        <ErrorState error={detail.error} onRetry={() => detail.refetch()} title="This title isn't available" />
      </div>
    );
  }
  if (detail.isPending) return <DetailsSkeleton />;

  const c = detail.data;
  const watchHref = `/watch/${encodeURIComponent(c.id)}`;
  const resuming = c.progress != null && c.progress > 0.01 && c.progress < 0.95;
  const people = [...(c.creators ?? []), ...(c.cast ?? [])];

  return (
    <article>
      {/* Backdrop */}
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[70svh] min-h-[460px] overflow-hidden md:h-[86svh] md:max-h-[1000px]">
          <motion.div className="absolute inset-0" initial={{ scale: 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.8, ease }}>
            <Artwork src={c.backdrop ?? c.thumbnail} alt="" title={c.title} sizes="100vw" priority quality={85} imgClassName="object-[center_30%] brightness-[0.85]" />
          </motion.div>
          <div className="scrim-bottom absolute inset-0" />
          <div className="scrim-left absolute inset-0 hidden md:block" />
          <div className="grain absolute inset-0" />
        </div>

        <div className="gutter grid gap-8 pt-[38svh] md:grid-cols-[minmax(200px,280px)_1fr] md:items-end md:gap-12 md:pt-[34svh] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="relative hidden aspect-[2/3] overflow-hidden rounded-md shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-line md:block"
          >
            <Artwork src={c.poster} alt={`${c.title} poster`} title={c.title} sizes="280px" priority />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }} className="max-w-3xl">
            <p className="eyebrow flex flex-wrap items-center gap-3">
              <span className="inline-block h-px w-6 bg-accent" aria-hidden />
              <span className="text-accent/90">{kindLabel(c.kind)}</span>
              {c.location && <span>{c.location}</span>}
            </p>
            <h1 className="display mt-4 text-balance text-[clamp(2.4rem,6vw,5.25rem)] text-ink">{c.title}</h1>
            {c.tagline && <p className="mt-4 text-lg text-ink-soft md:text-xl">{c.tagline}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {c.score != null && (
                <span className="inline-flex items-baseline gap-1.5 font-mono text-[13px] text-accent tabular" aria-label={`Rated ${c.score} out of 10`}>
                  {c.score.toFixed(1)}
                  <span className="text-[11px] text-ink-faint">/10</span>
                </span>
              )}
              <MetaLine
                parts={[
                  c.year?.toString(),
                  c.rating,
                  c.kind === "series" && c.seasons ? `${c.seasons} season${c.seasons > 1 ? "s" : ""}` : formatRuntime(c.runtimeMinutes),
                  c.language,
                ]}
              />
            </div>

            {c.synopsis && <p className="mt-6 max-w-[62ch] text-pretty text-[15.5px] leading-relaxed text-ink-soft md:text-[17px]">{c.synopsis}</p>}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={watchHref} variant="primary" size="lg" icon={resuming ? <RotateCcw strokeWidth={2} /> : <Play fill="currentColor" strokeWidth={0} />}>
                {resuming ? "Resume" : "Play"}
              </Button>
              <MyListButton item={c} />
              {c.trailerUrl && (
                <Button variant="ghost" size="lg" icon={<Clapperboard strokeWidth={1.5} />} onClick={() => setTrailerOpen(true)}>
                  Trailer
                </Button>
              )}
            </div>
            {resuming && (
              <div className="mt-5 flex max-w-xs items-center gap-3">
                <ProgressBar value={c.progress!} />
                <span className="shrink-0 text-[12px] text-ink-muted tabular">{remainingLabel(c)}</span>
              </div>
            )}

            {c.genres.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Genres">
                {c.genres.map((g) => (
                  <li key={g.id}>
                    <Chip href={`/explore?genre=${encodeURIComponent(g.slug)}`}>{g.name}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>

      {/* Credits + facts */}
      <div className="gutter mt-16 grid gap-12 md:mt-24 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div className="min-w-0">
          {people.length > 0 ? (
            <section aria-labelledby="credits">
              <SectionHeading id="credits" title="Cast & creators" />
              <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                {people.map((p, i) => (
                  <li key={`${p.id}-${i}`}>
                    <PersonCard person={p} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <Facts c={c} />
      </div>

      {/* More like this */}
      <div className="mt-16 md:mt-24">
        {related.isPending ? (
          <div className="gutter">
            <Skeleton className="mb-5 h-5 w-40" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        ) : related.data && related.data.length > 0 ? (
          <section aria-labelledby="more-like-this" className="gutter">
            <SectionHeading id="more-like-this" title="More like this" />
            <ContentGrid items={related.data.slice(0, 12)} variant="poster" />
          </section>
        ) : null}
      </div>

      {c.trailerUrl && (
        <Modal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={`${c.title} trailer`} className="w-[min(94vw,1100px)]">
          {trailerOpen && <video src={c.trailerUrl} controls autoPlay playsInline className="aspect-video w-full rounded bg-black" />}
        </Modal>
      )}
    </article>
  );
}

function Facts({ c }: { c: Content }) {
  const rows: [string, React.ReactNode][] = [];
  if (c.creators?.length) rows.push([c.kind === "series" ? "Created by" : "Directed by", c.creators.map((p) => <PersonLink key={p.id} id={p.id} name={p.name} />)]);
  if (c.cast?.length) rows.push(["Starring", c.cast.slice(0, 4).map((p) => <PersonLink key={p.id} id={p.id} name={p.name} />)]);
  if (c.genres.length) rows.push(["Genres", c.genres.map((g) => g.name).join(", ")]);
  if (c.language) rows.push(["Language", c.language]);
  if (c.location) rows.push(["Location", c.location]);
  if (c.rating) rows.push(["Maturity", c.rating]);
  if (!rows.length) return null;
  return (
    <aside aria-label="Details">
      <dl className="divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[110px_1fr] gap-4 py-3.5 text-[13.5px]">
            <dt className="text-ink-faint">{k}</dt>
            <dd className="flex flex-wrap gap-x-1 text-ink-soft [&>a:not(:last-child)]:after:content-[',']">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function PersonLink({ id, name }: { id: string; name: string }) {
  return (
    <Link href={`/person/${encodeURIComponent(id)}`} className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-accent">
      {name}
    </Link>
  );
}

function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading title">
      <div className="h-[70svh] min-h-[460px] bg-surface md:h-[86svh]" />
      <div className="gutter -mt-56 space-y-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-16 w-[min(520px,80%)]" />
        <Skeleton className="h-4 w-[min(600px,90%)]" />
        <Skeleton className="h-4 w-[min(420px,70%)]" />
      </div>
    </div>
  );
}

