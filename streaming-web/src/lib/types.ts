/**
 * Frontend domain model.
 *
 * Every response from the backend is normalised into these shapes in
 * src/lib/api/adapters.ts, so presentation components never depend on the
 * backend's exact field names.
 */

export type ContentKind =
  | "movie"
  | "series"
  | "short"
  | "documentary"
  | "photography"
  | "event"
  | "episode"
  | "other";

/** Visual frame used by cards. Chosen per kind by default, overridable per rail. */
export type CardVariant = "poster" | "landscape" | "square" | "portrait" | "wide";

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Person {
  id: string;
  name: string;
  role?: string; // "Director", "Lead", "Photographer"...
  character?: string;
  image?: string;
  bio?: string;
  knownFor?: Content[];
}

export interface Content {
  id: string;
  title: string;
  kind: ContentKind;
  synopsis?: string;
  tagline?: string;
  year?: number;
  /** Maturity rating, e.g. "PG-13", "16+". */
  rating?: string;
  /** Audience score, 0–10. */
  score?: number;
  runtimeMinutes?: number;
  seasons?: number;
  genres: Genre[];
  tags?: string[];
  language?: string;
  location?: string;
  poster?: string; // 2:3
  backdrop?: string; // 16:9 or wider
  thumbnail?: string; // 16:9 still
  logo?: string; // transparent title treatment
  trailerUrl?: string;
  cast?: Person[];
  creators?: Person[];
  isNew?: boolean;
  /** Present on items in Continue Watching. 0–1. */
  progress?: number;
  addedAt?: string;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  curator?: string;
  itemCount?: number;
  items?: Content[];
  /** Editorial collections get the large feature treatment. */
  editorial?: boolean;
}

export type RailType = "standard" | "continue" | "collections" | "editorial" | "ranked";

export interface Rail {
  id: string;
  title: string;
  subtitle?: string;
  type: RailType;
  variant?: CardVariant;
  items: Content[];
  collections?: Collection[];
  /** Link for "View all". */
  href?: string;
}

export interface HomeFeed {
  featured: Content[];
  rails: Rail[];
}

export interface WatchProgress {
  contentId: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
  content?: Content;
}

export interface HistoryEntry {
  content: Content;
  watchedAt: string;
  progress: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  isKids?: boolean;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan?: string;
  memberSince?: string;
  profiles?: Profile[];
}

export interface Preferences {
  language: string;
  subtitleLanguage: string;
  autoplayNext: boolean;
  autoplayPreviews: boolean;
  dataSaver: boolean;
  defaultQuality: string;
}

export interface Session {
  token?: string;
  user: User;
}

export interface PlaybackSource {
  url: string;
  /** "hls" for .m3u8, "dash" not handled natively, "mp4" for progressive. */
  type: "hls" | "mp4" | "dash";
  /** Present when the backend serves separate renditions per quality. */
  quality?: string;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

export interface Playback {
  contentId: string;
  sources: PlaybackSource[];
  subtitles: SubtitleTrack[];
  /** Resume point from the backend. */
  startAt?: number;
  /** Next episode or recommended follow-up. */
  next?: Content;
}

export interface SearchResults {
  query: string;
  movies: Content[];
  series: Content[];
  people: Person[];
  collections: Collection[];
  other: Content[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  total?: number;
}

export interface BrowseFilters {
  genre?: string;
  category?: string;
  kind?: ContentKind;
  sort?: "trending" | "newest" | "az" | "score";
  page?: number;
}
