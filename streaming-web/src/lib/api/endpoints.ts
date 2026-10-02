/**
 * The single map between frontend features and backend routes.
 *
 * When connecting to the real API, this is the first file to edit: change the
 * paths to match your routes. Services in src/services only ever reference
 * these keys, never raw URLs.
 *
 * Paths are relative to NEXT_PUBLIC_API_BASE_URL.
 */

const enc = encodeURIComponent;

export const endpoints = {
  auth: {
    login: () => "/auth/login", // POST { email, password } -> { token?, user }
    logout: () => "/auth/logout", // POST
    me: () => "/auth/me", // GET -> user (with profiles[] if multi-profile)
  },
  profiles: {
    list: () => "/profiles", // GET -> Profile[]
  },
  browse: {
    home: () => "/browse/home", // GET -> { featured: Content[], rails: Rail[] }
    list: () => "/content", // GET ?genre&category&kind&sort&page -> Paginated<Content>
    genres: () => "/genres", // GET -> Genre[]
    categories: () => "/categories", // GET -> Category[]
  },
  content: {
    detail: (id: string) => `/content/${enc(id)}`, // GET -> Content
    related: (id: string) => `/content/${enc(id)}/related`, // GET -> Content[]
    playback: (id: string) => `/content/${enc(id)}/playback`, // GET -> Playback
  },
  people: {
    detail: (id: string) => `/people/${enc(id)}`, // GET -> Person (with knownFor[])
  },
  collections: {
    list: () => "/collections", // GET -> Collection[]
    detail: (slug: string) => `/collections/${enc(slug)}`, // GET -> Collection (with items[])
  },
  search: {
    query: () => "/search", // GET ?q -> SearchResults
    trending: () => "/search/trending", // GET -> string[]
  },
  me: {
    list: () => "/me/list", // GET -> Content[]
    listItem: (id: string) => `/me/list/${enc(id)}`, // PUT to add, DELETE to remove
    progress: () => "/me/progress", // GET -> WatchProgress[] (continue watching)
    progressItem: (id: string) => `/me/progress/${enc(id)}`, // PUT { positionSeconds, durationSeconds }
    history: () => "/me/history", // GET -> HistoryEntry[]
    collections: () => "/me/collections", // GET -> Collection[] (saved)
    collectionItem: (id: string) => `/me/collections/${enc(id)}`, // PUT / DELETE
    recommendations: () => "/me/recommendations", // GET -> Content[]
    preferences: () => "/me/preferences", // GET / PATCH -> Preferences
  },
} as const;
