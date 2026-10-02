# Rumdul · streaming frontend

A cinematic streaming frontend built with Next.js 16 (App Router), React 19, Tailwind CSS 4, TanStack Query and Motion. It's designed to sit on top of an **existing backend**. It doesn't ship one.

```bash
cp .env.example .env.local   # mocks are on by default
npm install
npm run dev                  # http://localhost:3000
```

With `NEXT_PUBLIC_USE_MOCKS=true`, sign in with any email and a password of 4+ characters.

---

## Connecting your backend

Integration goes through four files. Everything else stays untouched.

| Step | File | What to do |
| --- | --- | --- |
| 1 | `.env.local` | Set `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_AUTH_STRATEGY` (`bearer` or `cookie`), `NEXT_PUBLIC_IMAGE_HOSTS` (your media CDN), then `NEXT_PUBLIC_USE_MOCKS=false`. |
| 2 | `src/lib/api/endpoints.ts` | Map each feature to your real route. Every expected request and response shape is commented inline. |
| 3 | `src/lib/api/adapters.ts` | Normalisers that turn backend JSON into frontend types. They already accept camelCase, snake_case and common aliases (`poster_path`, `overview`, `vote_average`...). If a field doesn't appear in the UI, fix it here. |
| 4 | `src/lib/api/client.ts` | Auth header, profile header, `{ data, meta }` envelope unwrapping, error normalisation. Adjust if your API differs. |

Then remove the mock layer: delete `src/mocks/`, `public/mock/`, and the `import "@/mocks/install"` line in `src/providers/AppProviders.tsx`.

### Endpoints the UI expects

```
POST /auth/login            GET  /content/:id            GET    /me/list
POST /auth/logout           GET  /content/:id/related    PUT    /me/list/:id
GET  /auth/me               GET  /content/:id/playback   DELETE /me/list/:id
GET  /profiles              GET  /people/:id             GET    /me/progress
GET  /browse/home           GET  /collections            PUT    /me/progress/:id
GET  /content?kind&genre…   GET  /collections/:slug      GET    /me/history
GET  /genres                GET  /search?q               GET    /me/collections (+ PUT/DELETE /:id)
GET  /categories            GET  /search/trending        GET    /me/recommendations
                                                         GET    /me/preferences (+ PATCH)
```

Missing endpoints degrade gracefully. A failed rail just isn't shown, and Continue Watching and My List hide when empty.

### Home feed

`GET /browse/home` returns `{ featured: Content[], rails: Rail[] }`. A rail's `type` picks its treatment:

- `standard`: card rail. `variant` sets the frame: `poster` 2:3, `landscape` 16:9, `portrait` 4:5, `square`, `wide` 21:9. If omitted, it's inferred from item kinds.
- `ranked`: numbered rail (01, 02...).
- `editorial`: large magazine block. Needs `collections[0]`.
- `collections`: rail of collection cards.

Continue Watching, My List and Recommended are fetched separately because they're user-specific.

### Playback

`GET /content/:id/playback` should return `sources[]` (`.m3u8` HLS or `.mp4` renditions with `quality`), `subtitles[]` (WebVTT), and an optional `startAt` resume point and `next` title. HLS plays natively on Safari and through lazy-loaded hls.js elsewhere, with quality levels read from the manifest. DASH (`.mpd`) shows a clear message. Add dash.js or Shaka in `src/components/player/useVideoSource.ts` if you need it. Progress is saved every 15s, on pause, and on leaving the page.

### Auth and profiles

- **bearer**: the token from the login response (`token`, `accessToken` or `access_token`) is stored and sent as `Authorization: Bearer`.
- **cookie**: requests use `credentials: "include"`, and your backend owns the session.
- A 401 from any request signs the user out.
- If the user payload (or `GET /profiles`) contains more than one profile, a "Who's watching" screen appears. The active profile is sent on every request in `NEXT_PUBLIC_PROFILE_HEADER`.

The route guard is client-side (`src/components/layout/AuthGate.tsx`). For server-side protection with cookie auth, add a `src/proxy.ts` (Next 16's replacement for middleware) that checks the cookie.

---

## Structure

```
src/
├── app/                    routes (App Router)
│   ├── (main)/             signed-in pages with navbar: home, explore, search,
│   │                       library, collections, title/[id], person/[id], profile
│   ├── watch/[id]/         full-bleed player
│   ├── login/  profiles/
├── components/
│   ├── ui/                 Button, IconButton, Artwork, Modal, Tabs, Switch, Chip,
│   │                       Skeleton, States (empty/error), ProgressBar, Logo
│   ├── layout/             Navbar, ProfileMenu, MobileNav, Footer, AuthGate
│   ├── content/            Hero, ContentRow, ContentCard, ContentGrid, CollectionCard,
│   │                       EditorialFeature, ContentDetails, RailRenderer, MyListButton
│   ├── search/             SearchBar, SearchResults
│   ├── player/             VideoPlayer, Timeline, SettingsMenu, useVideoSource
│   └── profile/            PreferencesForm
├── services/               one module per domain, calls the API through endpoints.ts
├── lib/                    api client, adapters, endpoints, types, config, formatting
├── hooks/                  useMyList (optimistic), useContinueWatching, useSavedCollections...
├── providers/              Query, Auth, Toast
└── mocks/                  DEVELOPMENT ONLY. Delete when connected.
```

Components never call `fetch`. They use hooks and services, and services only use `endpoints.ts`.

## Design notes

- Tokens live in `src/app/globals.css` (`@theme`): near-black canvas `#0a0a0b`, warm ink `#ede8df`, champagne accent `#c6ad7b`, used only for primary actions, active states and progress.
- Type: Geist Sans for display and body, Geist Mono for metadata and eyebrows.
- Motion: one easing curve (`cubic-bezier(.22,1,.36,1)`), slow fades and push-ins, all off under `prefers-reduced-motion`.
- The brand mark is an abstracted rumdul flower (Cambodia's national flower). Change the name with `NEXT_PUBLIC_BRAND_NAME`.

## Accessibility

Skip link, semantic landmarks, visible champagne focus rings, ARIA tabs and menus with arrow-key support, arrow-key movement between cards in a rail, the timeline as an ARIA slider, and player shortcuts (Space/K, J/L or ←/→, ↑/↓, M, F, C). Press `/` anywhere to search.
