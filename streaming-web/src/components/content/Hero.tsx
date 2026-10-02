"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Info, Play, Volume2, VolumeX } from "lucide-react";
import { Artwork } from "@/components/ui/Artwork";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { kindLabel, metaParts } from "@/lib/format";
import type { Content } from "@/lib/types";
import { MetaLine } from "./MetaLine";
import { MyListButton } from "./MyListButton";

const SLIDE_MS = 9000;
const TRAILER_DELAY_MS = 2600;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Featured hero. Crossfades between featured titles with a slow push-in,
 * and swaps the still for a muted trailer after a short pause when one exists.
 * Rotation pauses on hover/focus and while a trailer is playing.
 */
export function Hero({ items, autoplayPreviews = true }: { items: Content[]; autoplayPreviews?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerOn, setTrailerOn] = useState(false);
  const [muted, setMuted] = useState(true);
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const item = items[index];

  // Advance slides.
  useEffect(() => {
    if (items.length < 2 || paused || trailerOn) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, items.length, paused, trailerOn]);

  // Start trailer after a beat.
  useEffect(() => {
    setTrailerOn(false);
    if (!item?.trailerUrl || !autoplayPreviews || reduce) return;
    const t = setTimeout(() => setTrailerOn(true), TRAILER_DELAY_MS);
    return () => clearTimeout(t);
  }, [item?.id, item?.trailerUrl, autoplayPreviews, reduce]);

  // Pause the trailer when the hero scrolls out of view.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, [trailerOn]);

  if (!item) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative isolate h-[78svh] min-h-[540px] w-full overflow-hidden md:h-[92svh] md:max-h-[1100px] md:min-h-[640px]"
    >
      {/* Backdrop */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={item.id}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduce ? 1 : 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: SLIDE_MS / 1000 + 2, ease: "linear" }}
          >
            <Artwork src={item.backdrop ?? item.thumbnail} alt="" title={item.title} sizes="100vw" priority={index === 0} quality={85} imgClassName="object-[center_30%]" />
          </motion.div>

          {trailerOn && item.trailerUrl && (
            <motion.video
              ref={videoRef}
              key={item.trailerUrl}
              src={item.trailerUrl}
              muted={muted}
              autoPlay
              playsInline
              loop={false}
              onEnded={() => setTrailerOn(false)}
              onError={() => setTrailerOn(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease }}
              className="absolute inset-0 size-full object-cover"
              aria-hidden
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Scrims keep type legible on any image. */}
      <div className="scrim-bottom absolute inset-0 -z-[5]" aria-hidden />
      <div className="scrim-left absolute inset-0 -z-[5] hidden md:block" aria-hidden />
      <div className="grain absolute inset-0 -z-[5]" aria-hidden />

      {/* Copy */}
      <div className="gutter relative flex h-full flex-col justify-end pb-14 md:pb-[11vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
              exit: { opacity: 0, transition: { duration: 0.35 } },
            }}
            className="max-w-[min(680px,100%)]"
          >
            <Reveal>
              <p className="eyebrow mb-4 flex items-center gap-3 md:mb-5">
                <span className="inline-block h-px w-6 bg-accent" aria-hidden />
                <span className="text-accent/90">{kindLabel(item.kind)}</span>
                {item.isNew && <span className="text-ink-soft">New</span>}
                {item.location && <span className="text-ink-muted">{item.location}</span>}
              </p>
            </Reveal>
            <Reveal>
              <h1 className="display text-balance text-[clamp(2.6rem,7.2vw,6.25rem)] text-ink">{item.title}</h1>
            </Reveal>
            {(item.tagline || item.synopsis) && (
              <Reveal>
                <div className="mt-5 max-w-[52ch] text-pretty text-[15px] leading-relaxed md:mt-6 md:text-[17px]">
                  {item.tagline && <p className="font-medium text-ink">{item.tagline}</p>}
                  {item.synopsis && <p className="mt-1 line-clamp-3 text-ink-soft md:line-clamp-4">{item.synopsis}</p>}
                </div>
              </Reveal>
            )}
            <Reveal>
              <MetaLine parts={[...metaParts(item).slice(0, 3), item.genres.slice(0, 2).map((g) => g.name).join(", ")]} className="mt-5" />
            </Reveal>
            <Reveal>
              <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-9">
                <Button href={`/watch/${encodeURIComponent(item.id)}`} variant="primary" size="lg" icon={<Play fill="currentColor" strokeWidth={0} />}>
                  Play
                </Button>
                <MyListButton item={item} />
                <Button href={`/title/${encodeURIComponent(item.id)}`} variant="ghost" size="lg" icon={<Info strokeWidth={1.5} />} className="max-sm:hidden">
                  Details
                </Button>
              </div>
            </Reveal>
          </motion.div>
        </AnimatePresence>

        {/* Controls: slide indicators + mute */}
        <div className="absolute bottom-5 right-[var(--gutter)] flex items-center gap-4 md:bottom-[11vh]">
          {trailerOn && (
            <IconButton label={muted ? "Unmute preview" : "Mute preview"} tone="outline" size="sm" onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX strokeWidth={1.5} /> : <Volume2 strokeWidth={1.5} />}
            </IconButton>
          )}
          {items.length > 1 && (
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured titles">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${it.title}`}
                  onClick={() => setIndex(i)}
                  className="group/ind flex h-6 items-center"
                >
                  <span className={cn("relative block h-[2px] overflow-hidden rounded-full bg-ink/20 transition-[width] duration-500", i === index ? "w-10" : "w-4 group-hover/ind:w-6 group-hover/ind:bg-ink/40")}>
                    {i === index && (
                      <span
                        key={`${it.id}-${paused || trailerOn}`}
                        className="absolute inset-y-0 left-0 bg-accent"
                        style={{
                          width: paused || trailerOn ? "100%" : undefined,
                          animation: paused || trailerOn || reduce ? undefined : `rd-fill ${SLIDE_MS}ms linear forwards`,
                        }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes rd-fill{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[78svh] min-h-[540px] w-full bg-surface md:h-[92svh] md:max-h-[1100px] md:min-h-[640px]" role="status" aria-label="Loading featured">
      <div className="gutter absolute inset-x-0 bottom-14 space-y-5 md:bottom-[11vh]">
        <div className="h-3 w-40 animate-shimmer rounded bg-elevated" />
        <div className="h-16 w-[min(560px,80%)] animate-shimmer rounded bg-elevated" />
        <div className="h-4 w-[min(480px,70%)] animate-shimmer rounded bg-elevated" />
        <div className="flex gap-3 pt-4">
          <div className="h-12 w-28 rounded bg-elevated" />
          <div className="h-12 w-32 rounded bg-elevated" />
        </div>
      </div>
    </div>
  );
}
