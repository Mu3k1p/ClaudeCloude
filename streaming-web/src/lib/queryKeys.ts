import type { BrowseFilters } from "./types";

/** Central query keys so cache invalidation stays consistent. */
export const qk = {
  me: ["me"] as const,
  profiles: ["profiles"] as const,
  home: (profile?: string | null) => ["home", profile] as const,
  browse: (f: BrowseFilters) => ["browse", f] as const,
  genres: ["genres"] as const,
  categories: ["categories"] as const,
  content: (id: string) => ["content", id] as const,
  related: (id: string) => ["related", id] as const,
  playback: (id: string) => ["playback", id] as const,
  person: (id: string) => ["person", id] as const,
  collections: ["collections"] as const,
  collection: (slug: string) => ["collection", slug] as const,
  search: (q: string) => ["search", q] as const,
  trending: ["search-trending"] as const,
  myList: ["me", "list"] as const,
  progress: ["me", "progress"] as const,
  history: ["me", "history"] as const,
  savedCollections: ["me", "collections"] as const,
  recommendations: ["me", "recommendations"] as const,
  preferences: ["me", "preferences"] as const,
};
