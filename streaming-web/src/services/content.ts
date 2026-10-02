import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toCategory, toContent, toGenre, toHomeFeed, toPaginated, toPerson, toPlayback } from "@/lib/api/adapters";
import type { BrowseFilters, Category, Content, Genre, HomeFeed, Paginated, Person, Playback } from "@/lib/types";

const list = (raw: unknown) => (Array.isArray(raw) ? raw : []);

export const contentService = {
  async home(): Promise<HomeFeed> {
    return toHomeFeed(await api.get(endpoints.browse.home()));
  },
  async browse(filters: BrowseFilters): Promise<Paginated<Content>> {
    return toPaginated(await api.get(endpoints.browse.list(), { ...filters }), toContent);
  },
  async genres(): Promise<Genre[]> {
    return list(await api.get(endpoints.browse.genres())).map(toGenre);
  },
  async categories(): Promise<Category[]> {
    return list(await api.get(endpoints.browse.categories())).map(toCategory);
  },
  async detail(id: string): Promise<Content> {
    return toContent(await api.get(endpoints.content.detail(id)));
  },
  async related(id: string): Promise<Content[]> {
    const raw = await api.get(endpoints.content.related(id));
    return toPaginated(raw, toContent).items;
  },
  async playback(id: string): Promise<Playback> {
    return toPlayback(await api.get(endpoints.content.playback(id)), id);
  },
  async person(id: string): Promise<Person> {
    return toPerson(await api.get(endpoints.people.detail(id)));
  },
};
