"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SubtitleTrack } from "@/lib/types";
import type { QualityOption } from "./useVideoSource";

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type Panel = "root" | "speed" | "quality" | "subtitles";

interface Props {
  speed: number;
  onSpeed: (s: number) => void;
  qualities: QualityOption[];
  quality: number;
  onQuality: (id: number) => void;
  subtitles: SubtitleTrack[];
  subtitle: string | null;
  onSubtitle: (id: string | null) => void;
  onClose: () => void;
  initialPanel?: Panel;
}

export function SettingsMenu({ speed, onSpeed, qualities, quality, onQuality, subtitles, subtitle, onSubtitle, onClose, initialPanel = "root" }: Props) {
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[role=menuitem], [role=menuitemradio]")?.focus();
  }, [panel]);

  const onKey = (e: KeyboardEvent) => {
    e.stopPropagation();
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem], [role=menuitemradio]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      if (panel === "root" || initialPanel !== "root") onClose();
      else setPanel("root");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "ArrowLeft" && panel !== "root" && initialPanel === "root") {
      setPanel("root");
    }
  };

  const qualityLabel = qualities.find((q) => q.id === quality)?.label ?? "Auto";
  const subtitleLabel = subtitles.find((s) => s.id === subtitle)?.label ?? "Off";

  const row = "flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-[13.5px] text-ink-soft outline-none hover:bg-ink/[0.07] hover:text-ink focus-visible:bg-ink/[0.07] focus-visible:text-ink focus-visible:outline-none";

  const back = (title: string) =>
    initialPanel === "root" ? (
      <button type="button" role="menuitem" onClick={() => setPanel("root")} className={cn(row, "mb-1 border-b border-line pb-3 text-ink")}>
        <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden /> {title}
      </button>
    ) : (
      <p className="eyebrow px-3 pb-2 pt-1.5">{title}</p>
    );

  const radio = (label: string, checked: boolean, onClick: () => void) => (
    <button key={label} type="button" role="menuitemradio" aria-checked={checked} onClick={onClick} className={row}>
      <span className="w-4">{checked && <Check className="size-4 text-accent" strokeWidth={2} aria-hidden />}</span>
      {label}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      role="menu"
      aria-label="Playback settings"
      onKeyDown={onKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-[calc(100%+12px)] right-0 z-30 max-h-[60vh] w-64 overflow-y-auto rounded-md border border-line bg-[#141416]/95 p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md"
    >
      {panel === "root" && (
        <>
          <RootRow label="Playback speed" value={speed === 1 ? "Normal" : `${speed}×`} onClick={() => setPanel("speed")} className={row} />
          {qualities.length > 0 && <RootRow label="Quality" value={qualityLabel} onClick={() => setPanel("quality")} className={row} />}
          {subtitles.length > 0 && <RootRow label="Subtitles" value={subtitleLabel} onClick={() => setPanel("subtitles")} className={row} />}
        </>
      )}
      {panel === "speed" && (
        <>
          {back("Playback speed")}
          {SPEEDS.map((s) => radio(s === 1 ? "Normal" : `${s}×`, s === speed, () => onSpeed(s)))}
        </>
      )}
      {panel === "quality" && (
        <>
          {back("Quality")}
          {qualities.map((q) => radio(q.label, q.id === quality, () => onQuality(q.id)))}
        </>
      )}
      {panel === "subtitles" && (
        <>
          {back("Subtitles")}
          {radio("Off", subtitle === null, () => onSubtitle(null))}
          {subtitles.map((s) => radio(s.label, s.id === subtitle, () => onSubtitle(s.id)))}
        </>
      )}
    </motion.div>
  );
}

function RootRow({ label, value, onClick, className }: { label: string; value: string; onClick: () => void; className: string }) {
  return (
    <button type="button" role="menuitem" aria-haspopup="menu" onClick={onClick} className={className}>
      <span className="flex-1">{label}</span>
      <span className="text-[12.5px] text-ink-faint">{value}</span>
      <ChevronRight className="size-4 text-ink-faint" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
