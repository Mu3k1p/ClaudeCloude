import type { Content, ContentKind } from "./types";

export function formatRuntime(minutes?: number): string | undefined {
  if (!minutes) return undefined;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimecode(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const KIND_LABEL: Record<ContentKind, string> = {
  movie: "Film",
  series: "Series",
  short: "Short",
  documentary: "Documentary",
  photography: "Photography",
  event: "Event",
  episode: "Episode",
  other: "Feature",
};

export function kindLabel(kind: ContentKind): string {
  return KIND_LABEL[kind] ?? "Feature";
}

/** Compact metadata list used across hero, cards and details. */
export function metaParts(c: Content): string[] {
  return [
    c.year ? String(c.year) : undefined,
    c.rating,
    c.kind === "series" && c.seasons
      ? `${c.seasons} season${c.seasons > 1 ? "s" : ""}`
      : formatRuntime(c.runtimeMinutes),
    kindLabel(c.kind),
  ].filter(Boolean) as string[];
}

export function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.round((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} wk ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function remainingLabel(c: Content): string | undefined {
  if (c.progress == null || !c.runtimeMinutes) return undefined;
  const left = Math.max(1, Math.round(c.runtimeMinutes * (1 - c.progress)));
  return `${formatRuntime(left)} left`;
}
