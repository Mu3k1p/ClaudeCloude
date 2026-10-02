/**
 * Normalisers: backend payload -> frontend domain types.
 *
 * They accept camelCase and snake_case and a few common aliases so most
 * backends work without changes. If a field doesn't show up in the UI, the
 * fix almost always belongs here, not in a component.
 */
import type {
  Category,
  Collection,
  Content,
  ContentKind,
  Genre,
  HistoryEntry,
  HomeFeed,
  Paginated,
  Person,
  Playback,
  PlaybackSource,
  Preferences,
  Profile,
  Rail,
  RailType,
  SearchResults,
  SubtitleTrack,
  User,
  WatchProgress,
  CardVariant,
} from "../types";

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => !!v && typeof v === "object" && !Array.isArray(v);

/** First defined value among the given keys. */
function pick<T = unknown>(raw: Raw, ...keys: string[]): T | undefined {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

const str = (raw: Raw, ...keys: string[]) => {
  const v = pick(raw, ...keys);
  return v === undefined ? undefined : String(v);
};

const num = (raw: Raw, ...keys: string[]) => {
  const v = pick(raw, ...keys);
  const n = typeof v === "string" ? parseFloat(v) : (v as number | undefined);
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : isObj(v) && Array.isArray(v.items) ? v.items : []);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const KINDS: ContentKind[] = ["movie", "series", "short", "documentary", "photography", "event", "episode"];
const KIND_ALIASES: Record<string, ContentKind> = {
  film: "movie",
  feature: "movie",
  show: "series",
  tv: "series",
  "short-film": "short",
  short_film: "short",
  doc: "documentary",
  photo: "photography",
  "photo-essay": "photography",
  gallery: "photography",
  live: "event",
  concert: "event",
};

export function toKind(v: unknown): ContentKind {
  const s = String(v ?? "").toLowerCase();
  if ((KINDS as string[]).includes(s)) return s as ContentKind;
  return KIND_ALIASES[s] ?? "other";
}

export function toGenre(raw: unknown): Genre {
  if (typeof raw === "string") return { id: slugify(raw), name: raw, slug: slugify(raw) };
  const r = isObj(raw) ? raw : {};
  const name = str(r, "name", "title", "label") ?? "Untitled";
  return { id: str(r, "id", "_id", "slug") ?? slugify(name), name, slug: str(r, "slug") ?? slugify(name) };
}

export function toCategory(raw: unknown): Category {
  const r = isObj(raw) ? raw : {};
  const g = toGenre(r);
  return { ...g, description: str(r, "description"), image: str(r, "image", "image_url", "imageUrl", "cover") };
}

export function toPerson(raw: unknown): Person {
  const r = isObj(raw) ? raw : {};
  return {
    id: str(r, "id", "_id", "person_id", "personId") ?? slugify(str(r, "name") ?? "person"),
    name: str(r, "name", "full_name", "fullName") ?? "Unknown",
    role: str(r, "role", "job", "department"),
    character: str(r, "character", "character_name"),
    image: str(r, "image", "photo", "avatar", "profile_path", "profileUrl", "image_url"),
    bio: str(r, "bio", "biography"),
    knownFor: arr(pick(r, "knownFor", "known_for", "credits")).map(toContent),
  };
}

export function toContent(raw: unknown): Content {
  const r = isObj(raw) ? raw : {};
  const runtime = num(r, "runtimeMinutes", "runtime_minutes", "runtime", "duration_minutes");
  const durationSec = num(r, "duration", "duration_seconds", "durationSeconds");
  const release = str(r, "release_date", "releaseDate", "published_at", "date");
  const progress = num(r, "progress", "watch_progress");

  return {
    id: str(r, "id", "_id", "uuid", "slug") ?? "",
    title: str(r, "title", "name") ?? "Untitled",
    kind: toKind(pick(r, "kind", "type", "content_type", "contentType", "media_type", "format")),
    synopsis: str(r, "synopsis", "description", "overview", "summary"),
    tagline: str(r, "tagline", "logline"),
    year: num(r, "year", "release_year", "releaseYear") ?? (release ? new Date(release).getFullYear() || undefined : undefined),
    rating: str(r, "rating", "maturity_rating", "maturityRating", "certification", "age_rating"),
    score: num(r, "score", "vote_average", "imdb_rating", "user_rating"),
    runtimeMinutes: runtime ?? (durationSec ? Math.round(durationSec / 60) : undefined),
    seasons: num(r, "seasons", "season_count", "seasonCount", "number_of_seasons"),
    genres: arr(pick(r, "genres", "genre")).map(toGenre),
    tags: arr(pick(r, "tags", "keywords")).map((t) => (isObj(t) ? String(t.name ?? t.label ?? "") : String(t))),
    language: str(r, "language", "original_language"),
    location: str(r, "location", "city", "filming_location"),
    poster: str(r, "poster", "poster_url", "posterUrl", "poster_path", "cover", "image"),
    backdrop: str(r, "backdrop", "backdrop_url", "backdropUrl", "backdrop_path", "hero", "banner"),
    thumbnail: str(r, "thumbnail", "thumbnail_url", "thumbnailUrl", "still", "still_path"),
    logo: str(r, "logo", "logo_url", "logoUrl", "title_image"),
    trailerUrl: str(r, "trailerUrl", "trailer_url", "trailer", "preview_url", "previewUrl"),
    cast: arr(pick(r, "cast", "actors", "people")).map(toPerson),
    creators: arr(pick(r, "creators", "directors", "crew", "credits_creators")).map(toPerson),
    isNew: Boolean(pick(r, "isNew", "is_new", "new")),
    progress: progress !== undefined ? (progress > 1 ? progress / 100 : progress) : undefined,
    addedAt: str(r, "addedAt", "added_at", "created_at", "createdAt"),
  };
}

export function toCollection(raw: unknown): Collection {
  const r = isObj(raw) ? raw : {};
  const title = str(r, "title", "name") ?? "Collection";
  const items = arr(pick(r, "items", "contents", "content", "titles")).map(toContent);
  return {
    id: str(r, "id", "_id") ?? slugify(title),
    slug: str(r, "slug") ?? str(r, "id", "_id") ?? slugify(title),
    title,
    subtitle: str(r, "subtitle", "kicker"),
    description: str(r, "description", "summary"),
    image: str(r, "image", "cover", "cover_url", "coverUrl", "backdrop"),
    curator: str(r, "curator", "curated_by", "author"),
    itemCount: num(r, "itemCount", "item_count", "count") ?? (items.length || undefined),
    items,
    editorial: Boolean(pick(r, "editorial", "is_editorial", "featured")),
  };
}

const RAIL_TYPES: RailType[] = ["standard", "continue", "collections", "editorial", "ranked"];
const VARIANTS: CardVariant[] = ["poster", "landscape", "square", "portrait", "wide"];

export function toRail(raw: unknown): Rail {
  const r = isObj(raw) ? raw : {};
  const t = String(pick(r, "type", "layout", "style") ?? "standard");
  const v = str(r, "variant", "card", "card_style", "aspect");
  return {
    id: str(r, "id", "_id", "slug") ?? slugify(str(r, "title") ?? "rail"),
    title: str(r, "title", "name") ?? "",
    subtitle: str(r, "subtitle", "description"),
    type: (RAIL_TYPES as string[]).includes(t) ? (t as RailType) : "standard",
    variant: v && (VARIANTS as string[]).includes(v) ? (v as CardVariant) : undefined,
    items: arr(pick(r, "items", "contents", "content")).map(toContent),
    collections: arr(pick(r, "collections")).map(toCollection),
    href: str(r, "href", "link", "view_all_url"),
  };
}

export function toHomeFeed(raw: unknown): HomeFeed {
  if (Array.isArray(raw)) return { featured: [], rails: raw.map(toRail) };
  const r = isObj(raw) ? raw : {};
  const featured = pick(r, "featured", "hero", "spotlight");
  return {
    featured: (Array.isArray(featured) ? featured : featured ? [featured] : []).map(toContent),
    rails: arr(pick(r, "rails", "sections", "rows", "shelves")).map(toRail),
  };
}

export function toPaginated<T>(raw: unknown, map: (x: unknown) => T): Paginated<T> {
  if (Array.isArray(raw)) return { items: raw.map(map), page: 1, totalPages: 1, total: raw.length };
  const r = isObj(raw) ? raw : {};
  const items = arr(pick(r, "items", "results", "data", "content")).map(map);
  return {
    items,
    page: num(r, "page", "current_page", "currentPage") ?? 1,
    totalPages: num(r, "totalPages", "total_pages", "last_page", "pages") ?? 1,
    total: num(r, "total", "total_results", "count"),
  };
}

export function toProgress(raw: unknown): WatchProgress {
  const r = isObj(raw) ? raw : {};
  const content = pick(r, "content", "title", "media");
  return {
    contentId: str(r, "contentId", "content_id", "media_id") ?? (isObj(content) ? str(content, "id", "_id") ?? "" : ""),
    positionSeconds: num(r, "positionSeconds", "position_seconds", "position", "seconds") ?? 0,
    durationSeconds: num(r, "durationSeconds", "duration_seconds", "duration") ?? 0,
    updatedAt: str(r, "updatedAt", "updated_at", "watched_at") ?? new Date().toISOString(),
    content: isObj(content) ? toContent(content) : undefined,
  };
}

export function toHistoryEntry(raw: unknown): HistoryEntry {
  const r = isObj(raw) ? raw : {};
  const content = toContent(pick(r, "content", "title", "media") ?? r);
  const p = num(r, "progress") ?? content.progress ?? 1;
  return {
    content,
    watchedAt: str(r, "watchedAt", "watched_at", "updated_at") ?? new Date().toISOString(),
    progress: p > 1 ? p / 100 : p,
  };
}

export function toProfile(raw: unknown): Profile {
  const r = isObj(raw) ? raw : {};
  return {
    id: str(r, "id", "_id") ?? "",
    name: str(r, "name", "display_name") ?? "Profile",
    avatar: str(r, "avatar", "avatar_url", "image"),
    isKids: Boolean(pick(r, "isKids", "is_kids", "kids")),
    language: str(r, "language", "locale"),
  };
}

export function toUser(raw: unknown): User {
  const r = isObj(raw) ? (isObj(raw.user) ? (raw.user as Raw) : raw) : {};
  const profiles = arr(pick(r, "profiles"));
  return {
    id: str(r, "id", "_id", "uuid") ?? "",
    email: str(r, "email") ?? "",
    name: str(r, "name", "full_name", "display_name", "username") ?? "Member",
    avatar: str(r, "avatar", "avatar_url", "image", "picture"),
    plan: str(r, "plan", "subscription", "tier"),
    memberSince: str(r, "memberSince", "member_since", "created_at", "createdAt"),
    profiles: profiles.length ? profiles.map(toProfile) : undefined,
  };
}

export function toPreferences(raw: unknown): Preferences {
  const r = isObj(raw) ? raw : {};
  return {
    language: str(r, "language", "locale") ?? "en",
    subtitleLanguage: str(r, "subtitleLanguage", "subtitle_language") ?? "off",
    autoplayNext: (pick<boolean>(r, "autoplayNext", "autoplay_next") ?? true) as boolean,
    autoplayPreviews: (pick<boolean>(r, "autoplayPreviews", "autoplay_previews") ?? true) as boolean,
    dataSaver: (pick<boolean>(r, "dataSaver", "data_saver") ?? false) as boolean,
    defaultQuality: str(r, "defaultQuality", "default_quality") ?? "auto",
  };
}

function toSource(raw: unknown): PlaybackSource {
  if (typeof raw === "string") return { url: raw, type: sourceType(raw) };
  const r = isObj(raw) ? raw : {};
  const url = str(r, "url", "src", "file", "manifest") ?? "";
  const t = str(r, "type", "format", "mime");
  return {
    url,
    type: t?.includes("mpegurl") || t === "hls" ? "hls" : t?.includes("dash") || t === "dash" ? "dash" : t === "mp4" || t?.includes("mp4") ? "mp4" : sourceType(url),
    quality: str(r, "quality", "label", "resolution", "height"),
  };
}

function sourceType(url: string): PlaybackSource["type"] {
  if (/\.m3u8(\?|$)/i.test(url)) return "hls";
  if (/\.mpd(\?|$)/i.test(url)) return "dash";
  return "mp4";
}

export function toPlayback(raw: unknown, contentId: string): Playback {
  const r = isObj(raw) ? raw : {};
  const sources = arr(pick(r, "sources", "streams", "renditions")).map(toSource);
  const single = str(r, "url", "stream_url", "streamUrl", "hls", "manifest_url", "src");
  if (!sources.length && single) sources.push(toSource(single));
  const subs = arr(pick(r, "subtitles", "captions", "tracks", "text_tracks")).map((s, i): SubtitleTrack => {
    const t = isObj(s) ? s : {};
    const lang = str(t, "language", "lang", "srclang") ?? `track-${i}`;
    return {
      id: str(t, "id") ?? lang,
      language: lang,
      label: str(t, "label", "name") ?? lang.toUpperCase(),
      url: str(t, "url", "src", "file") ?? "",
      default: Boolean(pick(t, "default", "is_default")),
    };
  });
  const next = pick(r, "next", "up_next", "nextEpisode");
  return {
    contentId,
    sources,
    subtitles: subs,
    startAt: num(r, "startAt", "start_at", "resume_position", "position"),
    next: isObj(next) ? toContent(next) : undefined,
  };
}

export function toSearchResults(raw: unknown, query: string): SearchResults {
  const empty: SearchResults = { query, movies: [], series: [], people: [], collections: [], other: [] };
  // Flat array of mixed results: group by kind/type.
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const r = isObj(item) ? item : {};
      const t = String(pick(r, "type", "kind", "media_type", "result_type") ?? "").toLowerCase();
      if (t === "person" || t === "people") empty.people.push(toPerson(r));
      else if (t === "collection") empty.collections.push(toCollection(r));
      else {
        const c = toContent(r);
        if (c.kind === "movie") empty.movies.push(c);
        else if (c.kind === "series") empty.series.push(c);
        else empty.other.push(c);
      }
    }
    return empty;
  }
  const r = isObj(raw) ? raw : {};
  return {
    query,
    movies: arr(pick(r, "movies", "films")).map(toContent),
    series: arr(pick(r, "series", "shows", "tv")).map(toContent),
    people: arr(pick(r, "people", "persons", "cast")).map(toPerson),
    collections: arr(pick(r, "collections")).map(toCollection),
    other: arr(pick(r, "other", "content", "items", "results")).map(toContent),
  };
}
