"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Captions,
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { Artwork } from "@/components/ui/Artwork";
import { cn } from "@/lib/cn";
import { formatTimecode } from "@/lib/format";
import type { Content, Playback } from "@/lib/types";
import { SettingsMenu } from "./SettingsMenu";
import { Timeline } from "./Timeline";
import { useVideoSource } from "./useVideoSource";

const IDLE_MS = 2800;
const VOLUME_KEY = "rd.volume";

interface VideoPlayerProps {
  content: Content;
  playback: Playback;
  backHref: string;
  /** Called periodically and on pause/exit with the current position. */
  onProgress?: (position: number, duration: number) => void;
  autoplayNext?: boolean;
  defaultSubtitle?: string;
}

/**
 * Minimal cinematic player on top of a native <video>.
 * Keyboard: Space/K play-pause · ←/→ ±10s · ↑/↓ volume · M mute · F fullscreen · C captions.
 */
export function VideoPlayer({ content, playback, backHref, onProgress, autoplayNext = true, defaultSubtitle }: VideoPlayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const { qualities, quality, setQuality, error } = useVideoSource(video, playback.sources, playback.startAt);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | "settings" | "subtitles">(null);
  const [idle, setIdle] = useState(false);
  const [flash, setFlash] = useState<null | { key: number; icon: "play" | "pause" | "fwd" | "back" }>(null);
  const [pipSupported, setPipSupported] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSaved = useRef(0);

  const crossOrigin = playback.subtitles.some((s) => /^https?:/.test(s.url) && typeof window !== "undefined" && new URL(s.url).origin !== window.location.origin)
    ? "anonymous"
    : undefined;

  useEffect(() => setPipSupported("pictureInPictureEnabled" in document && document.pictureInPictureEnabled), []);

  // ── Restore volume preference ───────────────────────────────
  useEffect(() => {
    if (!video) return;
    try {
      const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "1");
      if (Number.isFinite(v)) video.volume = v;
    } catch {}
  }, [video]);

  // ── Default subtitle ────────────────────────────────────────
  useEffect(() => {
    const preferred =
      playback.subtitles.find((s) => s.default) ??
      (defaultSubtitle && defaultSubtitle !== "off" ? playback.subtitles.find((s) => s.language === defaultSubtitle) : undefined);
    setSubtitle(preferred?.id ?? null);
  }, [playback.subtitles, defaultSubtitle]);

  useEffect(() => {
    if (!video) return;
    const apply = () => {
      Array.from(video.textTracks).forEach((t, i) => {
        t.mode = playback.subtitles[i]?.id === subtitle ? "showing" : "disabled";
      });
    };
    apply();
    video.textTracks.addEventListener?.("addtrack", apply);
    return () => video.textTracks.removeEventListener?.("addtrack", apply);
  }, [video, subtitle, playback.subtitles]);

  // ── Progress reporting ──────────────────────────────────────
  const report = useCallback(() => {
    if (!video || !onProgress || !video.duration || !Number.isFinite(video.duration)) return;
    if (Math.abs(video.currentTime - lastSaved.current) < 2) return;
    lastSaved.current = video.currentTime;
    onProgress(video.currentTime, video.duration);
  }, [video, onProgress]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(report, 15000);
    return () => clearInterval(t);
  }, [playing, report]);

  useEffect(() => {
    const onHide = () => report();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      report();
    };
  }, [report]);

  // ── Controls visibility ─────────────────────────────────────
  const poke = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);
  useEffect(() => () => clearTimeout(idleTimer.current), []);
  const controlsVisible = !playing || !idle || menu !== null;

  // ── Actions ─────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    setFlash({ key: Date.now(), icon: video.paused ? "pause" : "play" });
  }, [video]);

  const seekBy = useCallback(
    (s: number) => {
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + s));
      setFlash({ key: Date.now(), icon: s > 0 ? "fwd" : "back" });
      poke();
    },
    [video, poke],
  );

  const setVol = useCallback(
    (v: number) => {
      if (!video) return;
      const nv = Math.max(0, Math.min(1, v));
      video.volume = nv;
      video.muted = nv === 0;
      try {
        localStorage.setItem(VOLUME_KEY, String(nv));
      } catch {}
    },
    [video],
  );

  const toggleMute = useCallback(() => {
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.6;
  }, [video]);

  const toggleFullscreen = useCallback(() => {
    const el = root.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    // iOS Safari only supports fullscreen on the video element itself.
    else (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  }, [video]);

  const togglePip = useCallback(async () => {
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {}
  }, [video]);

  const toggleCaptions = useCallback(() => {
    if (!playback.subtitles.length) return;
    setSubtitle((s) => (s ? null : (playback.subtitles.find((t) => t.language === defaultSubtitle) ?? playback.subtitles[0]).id));
  }, [playback.subtitles, defaultSubtitle]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (video) video.playbackRate = speed;
  }, [video, speed]);

  // ── Keyboard shortcuts (scoped to the player) ───────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    const onControl = target.closest("button, [role=slider], [role=menu], input");
    const k = e.key.toLowerCase();
    if ((k === " " || k === "enter") && onControl) return;
    const actions: Record<string, () => void> = {
      " ": togglePlay,
      k: togglePlay,
      arrowright: () => seekBy(10),
      arrowleft: () => seekBy(-10),
      l: () => seekBy(10),
      j: () => seekBy(-10),
      arrowup: () => setVol((video?.volume ?? 1) + 0.1),
      arrowdown: () => setVol((video?.volume ?? 1) - 0.1),
      m: toggleMute,
      f: toggleFullscreen,
      c: toggleCaptions,
    };
    if ((k.startsWith("arrow") && onControl?.matches("[role=slider], input")) || !(k in actions)) return;
    e.preventDefault();
    actions[k]();
    poke();
  };

  // Focus the player on mount so shortcuts work immediately.
  useEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, []);

  const remaining = duration - current;
  const showNext = autoplayNext && playback.next && duration > 0 && remaining < 25 && remaining > 0;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={root}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerMove={poke}
      onPointerDown={poke}
      className={cn(
        "group/player relative isolate aspect-video max-h-[100svh] w-full overflow-hidden bg-black outline-none",
        fullscreen && "aspect-auto h-full max-h-none",
        !controlsVisible && "cursor-none",
      )}
      aria-label={`${content.title} video player`}
      role="region"
    >
      <video
        ref={setVideo}
        className="absolute inset-0 size-full object-contain"
        playsInline
        autoPlay
        preload="auto"
        crossOrigin={crossOrigin}
        poster={content.backdrop ?? content.thumbnail}
        onClick={() => (menu ? setMenu(null) : togglePlay())}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          poke();
        }}
        onPause={() => {
          setPlaying(false);
          report();
        }}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onProgress={(e) => {
          const b = e.currentTarget.buffered;
          if (b.length) setBuffered(b.end(b.length - 1));
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onEnded={() => report()}
      >
        {playback.subtitles.map((s) => (
          <track key={s.id} kind="subtitles" src={s.url} srcLang={s.language} label={s.label} />
        ))}
      </video>

      {/* Poster plate until playback starts (autoplay may be blocked). */}
      <AnimatePresence>
        {!started && !error && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="pointer-events-none absolute inset-0">
            <Artwork src={content.backdrop ?? content.thumbnail} alt="" title={content.title} sizes="100vw" priority imgClassName="brightness-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center affordances */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {error ? (
          <div role="alert" className="pointer-events-auto max-w-sm rounded-md border border-line bg-black/80 px-6 py-5 text-center">
            <p className="text-sm text-ink">{error}</p>
            <Link href={backHref} className="mt-3 inline-block text-[13px] text-accent hover:text-accent-strong">
              Go back
            </Link>
          </div>
        ) : waiting && (started || playing) ? (
          <LoaderCircle className="size-10 animate-spin text-ink/70" strokeWidth={1.25} aria-label="Buffering" />
        ) : !playing && !started ? (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Play ${content.title}`}
            className="pointer-events-auto flex size-20 items-center justify-center rounded-full border border-ink/30 bg-black/30 text-ink backdrop-blur-sm transition-[transform,background-color,border-color] duration-500 hover:scale-105 hover:border-accent hover:text-accent"
          >
            <Play className="ml-1 size-8" fill="currentColor" strokeWidth={0} />
          </button>
        ) : null}

        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash.key}
              initial={{ opacity: 0.9, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.6 }}
              onAnimationComplete={() => setFlash(null)}
              className="absolute flex size-16 items-center justify-center rounded-full bg-black/45 text-ink"
              aria-hidden
            >
              {flash.icon === "play" && <Play className="ml-0.5 size-6" fill="currentColor" strokeWidth={0} />}
              {flash.icon === "pause" && <Pause className="size-6" fill="currentColor" strokeWidth={0} />}
              {flash.icon === "fwd" && <RotateCw className="size-6" strokeWidth={1.5} />}
              {flash.icon === "back" && <RotateCcw className="size-6" strokeWidth={1.5} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/75 to-transparent px-3 pb-12 pt-3 transition-opacity duration-500 md:px-6 md:pt-5",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Link href={backHref} aria-label="Back" className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/10 hover:text-ink">
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow text-[10px] text-ink-muted">Now playing</p>
          <p className="truncate text-[15px] font-medium text-ink">{content.title}</p>
        </div>
      </div>

      {/* Up next */}
      <AnimatePresence>
        {showNext && playback.next && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-28 right-4 z-20 w-64 overflow-hidden rounded-md border border-line bg-black/80 backdrop-blur-md md:right-8"
          >
            <Link href={`/watch/${encodeURIComponent(playback.next.id)}`} className="group/next block">
              <div className="relative aspect-video">
                <Artwork src={playback.next.thumbnail ?? playback.next.backdrop} alt="" title={playback.next.title} sizes="256px" />
              </div>
              <div className="p-3">
                <p className="eyebrow text-[10px] text-accent">Up next</p>
                <p className="mt-1 truncate text-sm text-ink group-hover/next:text-accent-strong">{playback.next.title}</p>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-16 transition-opacity duration-500 md:px-6 md:pb-4",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Timeline current={current} duration={duration} buffered={buffered} onSeek={(t) => video && (video.currentTime = t)} />

        <div className="mt-1 flex items-center gap-0.5 md:gap-1.5">
          <IconButton label={playing ? "Pause (K)" : "Play (K)"} onClick={togglePlay} className="text-ink">
            {playing ? <Pause fill="currentColor" strokeWidth={0} /> : <Play fill="currentColor" strokeWidth={0} className="ml-0.5" />}
          </IconButton>
          <IconButton label="Back 10 seconds" onClick={() => seekBy(-10)}>
            <RotateCcw strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Forward 10 seconds" onClick={() => seekBy(10)}>
            <RotateCw strokeWidth={1.5} />
          </IconButton>

          <div className="group/vol flex items-center">
            <IconButton label={muted ? "Unmute (M)" : "Mute (M)"} onClick={toggleMute}>
              <VolumeIcon strokeWidth={1.5} />
            </IconButton>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(parseFloat(e.target.value))}
              aria-label="Volume"
              className="hidden h-1 w-0 cursor-pointer appearance-none rounded-full bg-ink/25 accent-[var(--color-accent)] opacity-0 transition-[width,opacity] duration-300 focus:w-20 focus:opacity-100 group-hover/vol:w-20 group-hover/vol:opacity-100 sm:block [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink"
            />
          </div>

          <p className="ml-2 font-mono text-[12px] text-ink-soft tabular md:ml-3">
            {formatTimecode(current)}
            <span className="text-ink-faint"> / {formatTimecode(duration)}</span>
          </p>

          <div className="relative ml-auto flex items-center gap-0.5 md:gap-1.5">
            {playback.subtitles.length > 0 && (
              <IconButton
                label="Subtitles (C)"
                aria-haspopup="menu"
                aria-expanded={menu === "subtitles"}
                onClick={() => setMenu((m) => (m === "subtitles" ? null : "subtitles"))}
                className={cn(subtitle && "text-accent")}
              >
                <Captions strokeWidth={1.5} />
              </IconButton>
            )}
            <IconButton
              label="Settings"
              aria-haspopup="menu"
              aria-expanded={menu === "settings"}
              onClick={() => setMenu((m) => (m === "settings" ? null : "settings"))}
            >
              <Settings strokeWidth={1.5} className={cn("transition-transform duration-500", menu === "settings" && "rotate-45")} />
            </IconButton>
            {pipSupported && (
              <IconButton label="Picture in picture" onClick={togglePip} className="max-md:hidden">
                <PictureInPicture2 strokeWidth={1.5} />
              </IconButton>
            )}
            <IconButton label={fullscreen ? "Exit full screen (F)" : "Full screen (F)"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize strokeWidth={1.5} /> : <Maximize strokeWidth={1.5} />}
            </IconButton>

            <AnimatePresence>
              {menu && (
                <SettingsMenu
                  key={menu}
                  initialPanel={menu === "subtitles" ? "subtitles" : "root"}
                  speed={speed}
                  onSpeed={setSpeed}
                  qualities={qualities}
                  quality={quality}
                  onQuality={setQuality}
                  subtitles={playback.subtitles}
                  subtitle={subtitle}
                  onSubtitle={(id) => {
                    setSubtitle(id);
                    if (menu === "subtitles") setMenu(null);
                  }}
                  onClose={() => setMenu(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
