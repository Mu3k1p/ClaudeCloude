/**
 * DEVELOPMENT-ONLY in-process API. Resolves the same paths as
 * src/lib/api/endpoints.ts with simulated latency, and keeps user state
 * (My List, progress, history) in localStorage so it survives reloads.
 */
import type { RequestOptions, Transport } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import { SAMPLE_STREAMS, categories, collections, content, genres, home, mockUser, people, trendingSearches } from "./data";

type Item = (typeof content)[number];

interface MockState {
  myList: string[];
  savedCollections: string[];
  progress: Record<string, { positionSeconds: number; durationSeconds: number; updatedAt: string }>;
  history: { id: string; watchedAt: string; progress: number }[];
  preferences: Record<string, unknown>;
}

const STATE_KEY = "rd.mock.v1";
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

const initialState = (): MockState => ({
  myList: ["golden-age-reels", "northern-line", "grand-tourer", "iron-and-lacquer", "signal"],
  savedCollections: ["c-concrete", "c-machines"],
  progress: {
    "after-hours-riverside": { positionSeconds: 1460, durationSeconds: 3000, updatedAt: hoursAgo(5) },
    "the-quiet-engine": { positionSeconds: 3100, durationSeconds: 4680, updatedAt: hoursAgo(28) },
    "signal": { positionSeconds: 900, durationSeconds: 7080, updatedAt: hoursAgo(70) },
    "founders-table": { positionSeconds: 400, durationSeconds: 2700, updatedAt: hoursAgo(120) },
  },
  history: [
    { id: "after-hours-riverside", watchedAt: hoursAgo(5), progress: 0.48 },
    { id: "the-quiet-engine", watchedAt: hoursAgo(28), progress: 0.66 },
    { id: "kep-off-season", watchedAt: hoursAgo(50), progress: 1 },
    { id: "signal", watchedAt: hoursAgo(70), progress: 0.13 },
    { id: "the-last-projectionist", watchedAt: hoursAgo(140), progress: 1 },
    { id: "founders-table", watchedAt: hoursAgo(120), progress: 0.15 },
    { id: "dry-season", watchedAt: hoursAgo(300), progress: 1 },
  ],
  preferences: {
    language: "en",
    subtitleLanguage: "off",
    autoplayNext: true,
    autoplayPreviews: true,
    dataSaver: false,
    defaultQuality: "auto",
  },
});

let state: MockState | null = null;
function db(): MockState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STATE_KEY) : null;
    state = raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
  } catch {
    state = initialState();
  }
  return state!;
}
function persist() {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const find = (id: string): Item => {
  const item = content.find((c) => c.id === id);
  if (!item) throw new ApiError("Title not found", 404);
  return item;
};

const withProgress = (c: Item) => {
  const p = db().progress[c.id];
  return p ? { ...c, progress: p.positionSeconds / p.durationSeconds } : c;
};

const KIND_BY_CATEGORY: Record<string, string> = {
  films: "movie", series: "series", documentaries: "documentary", shorts: "short", photography: "photography", events: "event",
};

type Handler = (params: Record<string, string>, opts: RequestOptions) => unknown;

const routes: [string, string, Handler][] = [
  ["POST", "/auth/login", (_p, { body }) => {
    const { email, password } = (body ?? {}) as { email?: string; password?: string };
    if (!email || !password) throw new ApiError("Enter your email and password.", 422);
    if (password.length < 4) throw new ApiError("That password doesn't look right. Try at least 4 characters.", 401);
    return { token: "mock-token", user: { ...mockUser, email } };
  }],
  ["POST", "/auth/logout", () => undefined],
  ["GET", "/auth/me", () => mockUser],
  ["GET", "/profiles", () => mockUser.profiles],

  ["GET", "/browse/home", () => home],
  ["GET", "/genres", () => genres],
  ["GET", "/categories", () => categories],
  ["GET", "/content", (_p, { query = {} }) => {
    let items = [...content];
    const kind = (query.kind as string) || KIND_BY_CATEGORY[query.category as string];
    if (kind) items = items.filter((c) => c.type === kind);
    if (query.genre) items = items.filter((c) => c.genres.some((g) => g.slug === query.genre));
    switch (query.sort) {
      case "newest": items.sort((a, b) => b.addedAt.localeCompare(a.addedAt)); break;
      case "az": items.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "score": items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); break;
    }
    const page = Number(query.page ?? 1);
    const size = 18;
    return { items: items.slice((page - 1) * size, page * size), page, totalPages: Math.max(1, Math.ceil(items.length / size)), total: items.length };
  }],
  ["GET", "/content/:id", ({ id }) => withProgress(find(id))],
  ["GET", "/content/:id/related", ({ id }) => {
    const item = find(id);
    const gs = new Set(item.genres.map((g) => g.id));
    return content
      .filter((c) => c.id !== id)
      .map((c) => ({ c, s: c.genres.filter((g) => gs.has(g.id)).length + (c.type === item.type ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((x) => x.c);
  }],
  ["GET", "/content/:id/playback", ({ id }) => {
    const item = find(id);
    const p = db().progress[id];
    const idx = content.indexOf(item);
    // One title uses adaptive HLS to exercise quality selection; the rest use MP4.
    const sources = idx % 4 === 0
      ? [{ url: SAMPLE_STREAMS.hls, type: "hls" }]
      : [{ url: SAMPLE_STREAMS.mp4[idx % SAMPLE_STREAMS.mp4.length], type: "mp4", quality: "1080p" }];
    const next = content[(idx + 1) % content.length];
    return {
      sources,
      subtitles: [
        { id: "en", language: "en", label: "English", url: "/mock/subtitles-en.vtt" },
        { id: "km", language: "km", label: "ខ្មែរ Khmer", url: "/mock/subtitles-km.vtt" },
      ],
      startAt: p && p.positionSeconds / p.durationSeconds < 0.95 ? p.positionSeconds : 0,
      next,
    };
  }],
  ["GET", "/people/:id", ({ id }) => {
    const p = people.find((x) => x.id === id);
    if (!p) throw new ApiError("Person not found", 404);
    return { ...p, knownFor: content.filter((c) => [...(c.cast ?? []), ...(c.creators ?? [])].some((x) => x.id === id)) };
  }],
  ["GET", "/collections", () => collections.map(({ items, ...c }) => ({ ...c, itemCount: items.length, items: items.slice(0, 4) }))],
  ["GET", "/collections/:slug", ({ slug }) => {
    const c = collections.find((x) => x.slug === slug || x.id === slug);
    if (!c) throw new ApiError("Collection not found", 404);
    return c;
  }],

  ["GET", "/search/trending", () => trendingSearches],
  ["GET", "/search", (_p, { query = {} }) => {
    const q = String(query.q ?? "").trim().toLowerCase();
    if (!q) return { movies: [], series: [], people: [], collections: [], other: [] };
    const hit = (s?: string) => !!s && s.toLowerCase().includes(q);
    const matches = content.filter((c) => hit(c.title) || hit(c.description) || hit(c.location) || c.genres.some((g) => hit(g.name)));
    return {
      movies: matches.filter((c) => c.type === "movie"),
      series: matches.filter((c) => c.type === "series"),
      other: matches.filter((c) => c.type !== "movie" && c.type !== "series"),
      people: people.filter((p) => hit(p.name) || hit(p.role)),
      collections: collections.filter((c) => hit(c.title) || hit(c.description) || hit(c.subtitle)).map(({ items, ...c }) => ({ ...c, itemCount: items.length })),
    };
  }],

  ["GET", "/me/list", () => db().myList.map((id) => withProgress(find(id)))],
  ["PUT", "/me/list/:id", ({ id }) => {
    find(id);
    const s = db();
    if (!s.myList.includes(id)) s.myList.unshift(id);
    persist();
  }],
  ["DELETE", "/me/list/:id", ({ id }) => {
    const s = db();
    s.myList = s.myList.filter((x) => x !== id);
    persist();
  }],
  ["GET", "/me/progress", () =>
    Object.entries(db().progress)
      .filter(([, p]) => p.positionSeconds / p.durationSeconds < 0.95)
      .sort((a, b) => b[1].updatedAt.localeCompare(a[1].updatedAt))
      .map(([id, p]) => ({ contentId: id, ...p, content: withProgress(find(id)) }))],
  ["PUT", "/me/progress/:id", ({ id }, { body }) => {
    const b = body as { positionSeconds: number; durationSeconds: number };
    const s = db();
    s.progress[id] = { ...b, updatedAt: new Date().toISOString() };
    const ratio = b.durationSeconds ? b.positionSeconds / b.durationSeconds : 0;
    s.history = [{ id, watchedAt: new Date().toISOString(), progress: ratio }, ...s.history.filter((h) => h.id !== id)];
    persist();
  }],
  ["GET", "/me/history", () => db().history.map((h) => ({ content: find(h.id), watchedAt: h.watchedAt, progress: h.progress }))],
  ["GET", "/me/collections", () => db().savedCollections.map((id) => collections.find((c) => c.id === id)).filter(Boolean).map((c) => ({ ...c!, itemCount: c!.items.length }))],
  ["PUT", "/me/collections/:id", ({ id }) => {
    const s = db();
    if (!s.savedCollections.includes(id)) s.savedCollections.unshift(id);
    persist();
  }],
  ["DELETE", "/me/collections/:id", ({ id }) => {
    const s = db();
    s.savedCollections = s.savedCollections.filter((x) => x !== id);
    persist();
  }],
  ["GET", "/me/recommendations", () => {
    const seen = new Set([...db().myList, ...Object.keys(db().progress)]);
    return content.filter((c) => !seen.has(c.id)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 10);
  }],
  ["GET", "/me/preferences", () => db().preferences],
  ["PATCH", "/me/preferences", (_p, { body }) => {
    const s = db();
    s.preferences = { ...s.preferences, ...(body as object) };
    persist();
    return s.preferences;
  }],
];

const compiled = routes.map(([method, pattern, handler]) => {
  const keys: string[] = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)")) + "$");
  return { method, re, keys, handler };
});

const delay = () => new Promise((r) => setTimeout(r, 160 + Math.random() * 340));

export const mockTransport: Transport = async (path, opts) => {
  await delay();
  const method = opts.method ?? "GET";
  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = path.match(r.re);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    // Deep-copy so callers can't mutate the fixtures.
    const out = r.handler(params, opts);
    return out === undefined ? undefined : JSON.parse(JSON.stringify(out));
  }
  throw new ApiError(`No mock for ${method} ${path}`, 404);
};
