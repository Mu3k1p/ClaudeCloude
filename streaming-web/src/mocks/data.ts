/**
 * DEVELOPMENT-ONLY mock catalogue.
 *
 * Shaped like plausible backend JSON (it passes through the same adapters as
 * real responses). Delete the whole src/mocks folder and the one import in
 * src/providers/AppProviders.tsx once the real API is connected.
 *
 * Images come from picsum.photos (seeded so they stay stable). Video uses
 * public sample streams.
 */

const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/rd-${seed}/${w}/${h}`;
const art = (seed: string) => ({
  poster: img(seed, 600, 900),
  backdrop: img(seed + "-bd", 1920, 1080),
  thumbnail: img(seed + "-th", 800, 450),
});

export const SAMPLE_STREAMS = {
  hls: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  mp4: [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  ],
  trailer: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};

export const genres = [
  { id: "drama", name: "Drama", slug: "drama" },
  { id: "thriller", name: "Thriller", slug: "thriller" },
  { id: "architecture", name: "Architecture", slug: "architecture" },
  { id: "music", name: "Music", slug: "music" },
  { id: "motoring", name: "Motoring", slug: "motoring" },
  { id: "business", name: "Business", slug: "business" },
  { id: "culture", name: "Culture", slug: "culture" },
  { id: "science-fiction", name: "Science Fiction", slug: "science-fiction" },
  { id: "nightlife", name: "Nightlife", slug: "nightlife" },
  { id: "craft", name: "Craft", slug: "craft" },
  { id: "technology", name: "Technology", slug: "technology" },
  { id: "travel", name: "Travel", slug: "travel" },
];

const g = (...ids: string[]) => genres.filter((x) => ids.includes(x.id));

export const categories = [
  { id: "films", name: "Films", slug: "films", description: "Features and long-form fiction.", image: img("cat-films", 800, 1000) },
  { id: "series", name: "Series", slug: "series", description: "Stories told over seasons.", image: img("cat-series", 800, 1000) },
  { id: "documentaries", name: "Documentaries", slug: "documentaries", description: "Real people, real places.", image: img("cat-docs", 800, 1000) },
  { id: "shorts", name: "Short Films", slug: "shorts", description: "Under forty minutes. No filler.", image: img("cat-shorts", 800, 1000) },
  { id: "photography", name: "Photography", slug: "photography", description: "Photo essays and visual diaries.", image: img("cat-photo", 800, 1000) },
  { id: "events", name: "Events & Sessions", slug: "events", description: "Concerts, talks and live sessions.", image: img("cat-events", 800, 1000) },
];

export const people = [
  { id: "p-sokha", name: "Sokha Vann", role: "Director", image: img("p-sokha", 400, 400), bio: "Phnom Penh-born director working between documentary and fiction. Known for patient, architectural framing and stories about the city's new generation." },
  { id: "p-dara", name: "Dara Chea", role: "Lead", image: img("p-dara", 400, 400), bio: "Actor and producer. Started in theatre on Sisowath Quay, now one of the most recognisable faces in new Khmer cinema." },
  { id: "p-lina", name: "Lina Meas", role: "Photographer", image: img("p-lina", 400, 400), bio: "Documentary photographer focused on light, labour and the architecture of everyday life along the Mekong." },
  { id: "p-vicheka", name: "Vicheka Lim", role: "Lead", image: img("p-vicheka", 400, 400), bio: "Actor and musician. Splits her time between Phnom Penh and Paris." },
  { id: "p-kosal", name: "Kosal Heng", role: "Creator", image: img("p-kosal", 400, 400), bio: "Founder turned filmmaker. Makes series about people building things." },
  { id: "p-marcus", name: "Marcus Hale", role: "Director", image: img("p-marcus", 400, 400), bio: "British director of quiet thrillers and slow-burn dramas." },
  { id: "p-elena", name: "Elena Duarte", role: "Lead", image: img("p-elena", 400, 400), bio: "Portuguese actor with a run of acclaimed independent features." },
  { id: "p-bopha", name: "Bopha Sor", role: "Composer", image: img("p-bopha", 400, 400), bio: "Composer blending pinpeat instrumentation with modern electronic production." },
  { id: "p-pich", name: "Pich Sothea", role: "Lead", image: img("p-pich", 400, 400), bio: "Former racing driver, now presenter and occasional actor." },
];

const person = (id: string, extra: Record<string, string> = {}) => ({ ...people.find((p) => p.id === id)!, ...extra });

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

type MockPerson = (typeof people)[number] & { character?: string };
export interface MockItem {
  id: string; title: string; type: string; description: string; genres: typeof genres;
  year?: number; rating?: string; score?: number; runtime?: number; seasons?: number;
  tagline?: string; location?: string; language?: string; isNew?: boolean; addedAt: string;
  poster: string; backdrop: string; thumbnail: string; trailerUrl?: string;
  cast?: MockPerson[]; creators?: MockPerson[];
}

export const content: MockItem[] = [
  {
    id: "concrete-monsoon", title: "Concrete Monsoon", type: "documentary", year: 2025, rating: "PG", score: 8.7, runtime: 94,
    tagline: "A city built for the rain.",
    description: "How a generation of architects in the 1960s designed Phnom Penh around heat, shade and monsoon water, and the young designers now deciding what to keep.",
    genres: g("architecture", "culture"), location: "Phnom Penh", language: "Khmer, English", isNew: true, addedAt: daysAgo(3),
    ...art("concrete"), trailerUrl: SAMPLE_STREAMS.trailer,
    cast: [], creators: [person("p-sokha")],
  },
  {
    id: "after-hours-riverside", title: "After Hours, Riverside", type: "series", year: 2026, rating: "16+", score: 8.4, seasons: 2,
    tagline: "Nobody on the quay sleeps before three.",
    description: "A bar owner on Sisowath Quay, a DJ with one last shot, and the night-shift city that holds them together. Eight episodes, one long night at a time.",
    genres: g("drama", "nightlife", "music"), location: "Phnom Penh", isNew: true, addedAt: daysAgo(1),
    ...art("riverside"), trailerUrl: SAMPLE_STREAMS.trailer,
    cast: [person("p-dara", { character: "Visal" }), person("p-vicheka", { character: "Mealea" })], creators: [person("p-sokha")],
  },
  {
    id: "the-quiet-engine", title: "The Quiet Engine", type: "documentary", year: 2024, rating: "PG", score: 8.1, runtime: 78,
    tagline: "Every car remembers who drove it.",
    description: "Inside a two-man Phnom Penh workshop restoring 1960s European saloons, bolt by bolt, for owners who care more about the story than the price.",
    genres: g("motoring", "craft"), location: "Phnom Penh", addedAt: daysAgo(20),
    ...art("engine"), cast: [person("p-pich")], creators: [person("p-kosal")],
  },
  {
    id: "founders-table", title: "Founders' Table", type: "series", year: 2025, rating: "PG", score: 7.9, seasons: 1,
    description: "One dinner, one founder, no slides. Conversations with the people building Cambodia's new companies, from logistics to coffee to code.",
    genres: g("business", "technology"), addedAt: daysAgo(12),
    ...art("founders"), cast: [], creators: [person("p-kosal")],
  },
  {
    id: "pepper-coast", title: "Pepper Coast", type: "short", year: 2025, rating: "G", score: 7.8, runtime: 24,
    description: "A season on a Kampot pepper farm, from first flower to the harvest that a family has timed by rain for four generations.",
    genres: g("culture", "craft", "travel"), location: "Kampot", addedAt: daysAgo(6),
    ...art("pepper"), creators: [person("p-lina")],
  },
  {
    id: "blue-hour-bkk1", title: "Blue Hour, BKK1", type: "photography", year: 2026, rating: "G",
    description: "Thirty-two frames shot in the twenty minutes after sunset, across one neighbourhood, over one dry season.",
    genres: g("architecture", "culture"), location: "Phnom Penh", isNew: true, addedAt: daysAgo(2),
    ...art("bluehour"), creators: [person("p-lina")],
  },
  {
    id: "golden-age-reels", title: "Golden Age Reels", type: "documentary", year: 2023, rating: "PG", score: 9.0, runtime: 102,
    tagline: "The films survived. Barely.",
    description: "The archivists, collectors and families piecing together the lost cinema and rock records of 1960s Cambodia, one reel at a time.",
    genres: g("music", "culture"), addedAt: daysAgo(90),
    ...art("goldenage"), creators: [person("p-sokha")], cast: [person("p-bopha")],
  },
  {
    id: "signal", title: "Signal", type: "movie", year: 2024, rating: "13+", score: 7.6, runtime: 118,
    description: "A radio astronomer picks up a pattern no one else can hear, and has to decide how much of her life she's willing to bet on it.",
    genres: g("science-fiction", "drama"), addedAt: daysAgo(40),
    ...art("signal"), cast: [person("p-elena", { character: "Dr. Ines Rocha" })], creators: [person("p-marcus")],
  },
  {
    id: "the-long-lap", title: "The Long Lap", type: "documentary", year: 2025, rating: "PG", score: 8.2, runtime: 88,
    description: "A former touring-car driver returns to racing at fifty-one, with a borrowed car and a team of friends who've never worked a pit stop.",
    genres: g("motoring"), addedAt: daysAgo(15),
    ...art("longlap"), cast: [person("p-pich")], creators: [person("p-kosal")],
  },
  {
    id: "monolith", title: "Monolith", type: "movie", year: 2025, rating: "16+", score: 7.4, runtime: 126,
    description: "An engineer hired to demolish a brutalist tower discovers the building's original plans hide a floor that doesn't exist.",
    genres: g("thriller", "architecture"), isNew: true, addedAt: daysAgo(4),
    ...art("monolith"), cast: [person("p-dara", { character: "Rith" }), person("p-elena", { character: "Clara" })], creators: [person("p-marcus")],
  },
  {
    id: "kep-off-season", title: "Kep, Off Season", type: "short", year: 2024, rating: "PG", score: 7.7, runtime: 31,
    description: "Two old friends, one empty villa, and the conversation they've avoided for twelve years.",
    genres: g("drama", "travel"), location: "Kep", addedAt: daysAgo(30),
    ...art("kep"), cast: [person("p-vicheka"), person("p-dara")], creators: [person("p-sokha")],
  },
  {
    id: "rooftop-sessions", title: "Rooftop Sessions", type: "event", year: 2026, rating: "G", runtime: 62,
    description: "Live sets recorded above the city at golden hour. This edition: Khmer jazz, modern pinpeat and a closing set by Bopha Sor.",
    genres: g("music", "nightlife"), location: "Phnom Penh", isNew: true, addedAt: daysAgo(5),
    ...art("rooftop"), cast: [person("p-bopha")],
  },
  {
    id: "build-week", title: "Build Week: Phnom Penh", type: "event", year: 2025, rating: "G", runtime: 74,
    description: "Seven days, forty engineers, twelve products shipped. The full keynote and demo day from the city's biggest builder gathering.",
    genres: g("technology", "business"), location: "Phnom Penh", addedAt: daysAgo(25),
    ...art("buildweek"), creators: [person("p-kosal")],
  },
  {
    id: "the-last-projectionist", title: "The Last Projectionist", type: "short", year: 2023, rating: "G", score: 8.3, runtime: 18,
    description: "He's run the same 35mm projector for forty years. Tonight is the final screening.",
    genres: g("drama", "culture"), addedAt: daysAgo(70),
    ...art("projectionist"), creators: [person("p-sokha")],
  },
  {
    id: "northern-line", title: "Northern Line", type: "series", year: 2024, rating: "16+", score: 8.0, seasons: 3,
    description: "A detective transferred to a border town finds the case that ended her career was never really closed.",
    genres: g("thriller", "drama"), addedAt: daysAgo(60),
    ...art("northern"), cast: [person("p-elena", { character: "DI Ana Morais" })], creators: [person("p-marcus")],
  },
  {
    id: "velvet-hours", title: "Velvet Hours", type: "movie", year: 2026, rating: "13+", score: 7.9, runtime: 109,
    description: "A jazz singer in 1968 Phnom Penh is offered a record deal in Paris. The night before she leaves, everything she's built asks her to stay.",
    genres: g("drama", "music"), location: "Phnom Penh", isNew: true, addedAt: daysAgo(2),
    ...art("velvet"), trailerUrl: SAMPLE_STREAMS.trailer,
    cast: [person("p-vicheka", { character: "Sophea" }), person("p-dara", { character: "Bunthoeun" })], creators: [person("p-sokha")],
  },
  {
    id: "studio-63", title: "Studio 63", type: "series", year: 2025, rating: "PG", score: 7.5, seasons: 1,
    description: "Designers, tailors, producers and app makers. A series about Cambodian creators and the rooms where the work actually happens.",
    genres: g("culture", "craft"), addedAt: daysAgo(18),
    ...art("studio63"), creators: [person("p-kosal")],
  },
  {
    id: "mekong-light", title: "Mekong Light", type: "photography", year: 2025, rating: "G",
    description: "A photo essay following the river from Kratie to the capital, in available light only.",
    genres: g("travel", "culture"), location: "Kratie", addedAt: daysAgo(14),
    ...art("mekong"), creators: [person("p-lina")],
  },
  {
    id: "street-240", title: "Faces of Street 240", type: "photography", year: 2024, rating: "G",
    description: "Portraits of the shopkeepers, tailors and gallery owners on one of the city's quietest streets.",
    genres: g("culture"), location: "Phnom Penh", addedAt: daysAgo(45),
    ...art("street240"), creators: [person("p-lina")],
  },
  {
    id: "overture", title: "Overture", type: "event", year: 2024, rating: "G", runtime: 96,
    description: "A full-length orchestral performance recorded at the Chaktomuk riverfront, with new works by young Cambodian composers.",
    genres: g("music"), addedAt: daysAgo(80),
    ...art("overture"), cast: [person("p-bopha")],
  },
  {
    id: "glasshouse", title: "Glasshouse", type: "movie", year: 2023, rating: "16+", score: 7.2, runtime: 101,
    description: "A smart-home architect locked inside her own prototype house has six hours to work out who rewrote the code.",
    genres: g("thriller", "technology"), addedAt: daysAgo(100),
    ...art("glasshouse"), cast: [person("p-elena")], creators: [person("p-marcus")],
  },
  {
    id: "iron-and-lacquer", title: "Iron & Lacquer", type: "documentary", year: 2024, rating: "G", score: 8.5, runtime: 66,
    description: "Lacquer artists and metalworkers in Siem Reap, and the slow, layered methods that refuse to be rushed.",
    genres: g("craft", "culture"), location: "Siem Reap", addedAt: daysAgo(35),
    ...art("lacquer"), creators: [person("p-lina")],
  },
  {
    id: "echo-chamber", title: "Echo Chamber", type: "documentary", year: 2026, rating: "PG", score: 7.8, runtime: 84,
    description: "Engineers, linguists and teachers on what happens when AI learns Khmer, and who gets to decide how.",
    genres: g("technology", "culture"), isNew: true, addedAt: daysAgo(7),
    ...art("echo"), creators: [person("p-kosal")],
  },
  {
    id: "grand-tourer", title: "Grand Tourer", type: "series", year: 2025, rating: "PG", score: 8.1, seasons: 1,
    description: "One classic coupé, the coast road from Phnom Penh to Kampot, and a new guest in the passenger seat each episode.",
    genres: g("motoring", "travel"), addedAt: daysAgo(22),
    ...art("grandtourer"), cast: [person("p-pich")], creators: [person("p-kosal")],
  },
  {
    id: "the-architects-daughter", title: "The Architect's Daughter", type: "movie", year: 2024, rating: "13+", score: 8.0, runtime: 112,
    description: "Returning to sell her late father's house, a lawyer from Melbourne finds the building is the last thing he designed, and the first thing he lied about.",
    genres: g("drama", "architecture"), addedAt: daysAgo(55),
    ...art("architectsdaughter"), cast: [person("p-vicheka", { character: "Chenda" })], creators: [person("p-sokha")],
  },
  {
    id: "low-light", title: "Low Light", type: "photography", year: 2026, rating: "G",
    description: "Night photographs of Phnom Penh's markets, garages and late kitchens. No flash, no tripod.",
    genres: g("nightlife", "culture"), location: "Phnom Penh", addedAt: daysAgo(9),
    ...art("lowlight"), creators: [person("p-lina")],
  },
  {
    id: "coffee-at-seven", title: "Coffee at Seven", type: "short", year: 2025, rating: "G", score: 7.4, runtime: 14,
    description: "A barista, a regular, and a year of mornings told in eleven cups.",
    genres: g("drama"), addedAt: daysAgo(11),
    ...art("coffee"), cast: [person("p-dara")],
  },
  {
    id: "dry-season", title: "Dry Season", type: "movie", year: 2022, rating: "13+", score: 7.7, runtime: 97,
    description: "A rice farmer's son comes home from the city to help with the last harvest before the land is sold.",
    genres: g("drama", "culture"), addedAt: daysAgo(150),
    ...art("dryseason"), cast: [person("p-dara")], creators: [person("p-sokha")],
  },
  {
    id: "sound-of-the-city", title: "Sound of the City", type: "documentary", year: 2025, rating: "PG", score: 7.6, runtime: 72,
    description: "Producers, street musicians and wedding bands, recorded across one Phnom Penh summer.",
    genres: g("music", "culture"), addedAt: daysAgo(28),
    ...art("soundcity"), cast: [person("p-bopha")], creators: [person("p-sokha")],
  },
  {
    id: "halfway-home", title: "Halfway Home", type: "series", year: 2026, rating: "13+", score: 7.8, seasons: 1,
    description: "Three siblings from the diaspora inherit a guesthouse in Battambang and have one year to make it work.",
    genres: g("drama", "travel"), location: "Battambang", isNew: true, addedAt: daysAgo(8),
    ...art("halfway"), cast: [person("p-vicheka"), person("p-dara")], creators: [person("p-sokha")],
  },
];

const byId = (...ids: string[]) => ids.map((id) => content.find((c) => c.id === id)!).filter(Boolean);

export const collections = [
  {
    id: "c-after-dark", slug: "after-dark", title: "Phnom Penh After Dark", subtitle: "Editorial",
    description: "Rooftops, riverside bars and the people who keep the city awake. A curated look at nightlife, music and late-night work.",
    image: img("col-afterdark", 1920, 1080), curator: "The Editors", editorial: true,
    items: byId("after-hours-riverside", "rooftop-sessions", "low-light", "velvet-hours", "sound-of-the-city"),
  },
  {
    id: "c-concrete", slug: "concrete-and-light", title: "Concrete & Light", subtitle: "Architecture",
    description: "New Khmer Architecture, its legacy, and the young studios rewriting it.",
    image: img("col-concrete", 1920, 1080), curator: "Sokha Vann", editorial: true,
    items: byId("concrete-monsoon", "monolith", "blue-hour-bkk1", "the-architects-daughter"),
  },
  {
    id: "c-builders", slug: "builders", title: "Builders", subtitle: "Founders & creators",
    description: "Stories of people who start things: companies, studios, workshops.",
    image: img("col-builders", 1600, 900),
    items: byId("founders-table", "build-week", "studio-63", "echo-chamber", "the-quiet-engine"),
  },
  {
    id: "c-machines", slug: "machines", title: "Machines", subtitle: "Motoring",
    description: "Old saloons, coast roads and the people who keep them running.",
    image: img("col-machines", 1600, 900),
    items: byId("the-quiet-engine", "the-long-lap", "grand-tourer"),
  },
  {
    id: "c-coast", slug: "the-coast", title: "The Coast", subtitle: "Kampot & Kep",
    description: "Pepper farms, empty villas and the slow pace south of the capital.",
    image: img("col-coast", 1600, 900),
    items: byId("pepper-coast", "kep-off-season", "grand-tourer"),
  },
  {
    id: "c-golden-age", slug: "golden-age", title: "The Golden Age", subtitle: "1960s cinema & sound",
    description: "The films, records and memories of a decade the country is still rediscovering.",
    image: img("col-goldenage", 1600, 900),
    items: byId("golden-age-reels", "velvet-hours", "the-last-projectionist", "overture"),
  },
  {
    id: "c-frames", slug: "frames", title: "Frames", subtitle: "Photography",
    description: "Photo essays in available light.",
    image: img("col-frames", 1600, 900),
    items: byId("blue-hour-bkk1", "mekong-light", "street-240", "low-light"),
  },
  {
    id: "c-local", slug: "local-stories", title: "Local Stories", subtitle: "Home",
    description: "Small stories from Battambang to Kratie.",
    image: img("col-local", 1600, 900),
    items: byId("dry-season", "halfway-home", "iron-and-lacquer", "coffee-at-seven", "mekong-light"),
  },
];

export const home = {
  featured: byId("velvet-hours", "concrete-monsoon", "after-hours-riverside", "monolith"),
  rails: [
    { id: "trending", title: "Trending this week", type: "ranked", variant: "poster", items: byId("after-hours-riverside", "velvet-hours", "golden-age-reels", "monolith", "concrete-monsoon", "northern-line", "the-quiet-engine", "signal", "halfway-home", "the-long-lap") },
    { id: "recent", title: "Recently added", type: "standard", variant: "landscape", href: "/explore?sort=newest", items: byId("halfway-home", "echo-chamber", "low-light", "rooftop-sessions", "monolith", "blue-hour-bkk1", "coffee-at-seven", "pepper-coast") },
    { id: "editorial-afterdark", title: "Phnom Penh After Dark", type: "editorial", collections: [collections[0]], items: collections[0].items },
    { id: "collections", title: "Curated collections", type: "collections", href: "/collections", collections: collections.slice(2), items: [] },
    { id: "docs", title: "Documentaries worth your evening", type: "standard", variant: "poster", href: "/explore?kind=documentary", items: byId("golden-age-reels", "iron-and-lacquer", "the-long-lap", "concrete-monsoon", "the-quiet-engine", "echo-chamber", "sound-of-the-city") },
    { id: "frames", title: "Frames", subtitle: "Photo essays in available light", type: "standard", variant: "portrait", href: "/explore?kind=photography", items: byId("blue-hour-bkk1", "mekong-light", "street-240", "low-light") },
    { id: "editorial-concrete", title: "Concrete & Light", type: "editorial", collections: [collections[1]], items: collections[1].items },
    { id: "shorts", title: "Short films", subtitle: "Under forty minutes", type: "standard", variant: "landscape", href: "/explore?kind=short", items: byId("the-last-projectionist", "kep-off-season", "pepper-coast", "coffee-at-seven") },
    { id: "sessions", title: "Events & sessions", type: "standard", variant: "wide", href: "/explore?kind=event", items: byId("rooftop-sessions", "build-week", "overture") },
    { id: "after-midnight", title: "Slow-burn drama", type: "standard", variant: "poster", items: byId("the-architects-daughter", "dry-season", "northern-line", "glasshouse", "signal", "kep-off-season") },
  ],
};

export const trendingSearches = ["Velvet Hours", "Architecture", "Kampot", "Grand Tourer", "Nightlife", "Sokha Vann", "Short films", "Photography"];

export const mockUser = {
  id: "u-1",
  email: "you@example.com",
  name: "Kobe",
  avatar: img("avatar-kobe", 300, 300),
  plan: "Premium · 4K",
  memberSince: "2024-03-14T00:00:00.000Z",
  profiles: [
    { id: "pr-1", name: "Kobe", avatar: img("avatar-kobe", 300, 300), language: "en" },
    { id: "pr-2", name: "Studio", avatar: img("avatar-studio", 300, 300), language: "en" },
    { id: "pr-3", name: "Family", avatar: img("avatar-family", 300, 300), language: "km" },
  ],
};
