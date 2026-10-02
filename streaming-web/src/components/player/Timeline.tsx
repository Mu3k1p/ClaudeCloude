"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatTimecode } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Scrubber with buffered range, hover timecode and full keyboard support
 * (it's an ARIA slider: arrows ±5s, PageUp/PageDown ±30s, Home/End).
 */
export function Timeline({
  current,
  duration,
  buffered,
  onSeek,
}: {
  current: number;
  duration: number;
  buffered: number;
  onSeek: (t: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const ratioAt = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };

  const shown = drag ?? (duration ? current / duration : 0);
  const pct = (v: number) => `${Math.max(0, Math.min(1, v)) * 100}%`;

  const onPointerDown = (e: PointerEvent) => {
    if (!duration) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag(ratioAt(e.clientX));
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!duration) return;
    const r = ratioAt(e.clientX);
    setHover(r);
    if (drag != null) setDrag(r);
  };
  const onPointerUp = () => {
    if (drag != null) onSeek(drag * duration);
    setDrag(null);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step: Record<string, number> = { ArrowRight: 5, ArrowLeft: -5, ArrowUp: 5, ArrowDown: -5, PageUp: 30, PageDown: -30 };
    if (e.key in step) {
      e.preventDefault();
      e.stopPropagation();
      onSeek(Math.max(0, Math.min(duration, current + step[e.key])));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(Math.max(0, duration - 1));
    }
  };

  const tip = drag ?? hover;

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(current)}
      aria-valuetext={`${formatTimecode(current)} of ${formatTimecode(duration)}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
      className="group/tl relative flex h-5 cursor-pointer touch-none items-center focus-visible:outline-offset-4"
    >
      <div className={cn("relative h-[3px] w-full overflow-hidden rounded-full bg-ink/20 transition-[height] duration-200", (hover != null || drag != null) && "h-[5px]", "group-focus-visible/tl:h-[5px]")}>
        <div className="absolute inset-y-0 left-0 bg-ink/30" style={{ width: pct(duration ? buffered / duration : 0) }} />
        {hover != null && drag == null && <div className="absolute inset-y-0 left-0 bg-ink/20" style={{ width: pct(hover) }} />}
        <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: pct(shown) }} />
      </div>
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong shadow-[0_0_0_4px_rgb(198_173_123/0.18)] transition-transform duration-200",
          hover != null || drag != null ? "scale-100" : "scale-0 group-focus-visible/tl:scale-100",
        )}
        style={{ left: pct(shown) }}
      />
      {tip != null && duration > 0 && (
        <div
          className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-black/80 px-2 py-1 font-mono text-[11px] text-ink tabular"
          style={{ left: pct(tip) }}
        >
          {formatTimecode(tip * duration)}
        </div>
      )}
    </div>
  );
}
