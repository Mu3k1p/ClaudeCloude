import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toSearchResults } from "@/lib/api/adapters";
import type { SearchResults } from "@/lib/types";

export const searchService = {
  async query(q: string, signal?: AbortSignal): Promise<SearchResults> {
    return toSearchResults(await api.get(endpoints.search.query(), { q }, signal), q);
  },
  async trending(): Promise<string[]> {
    const raw = await api.get<unknown[]>(endpoints.search.trending());
    return (Array.isArray(raw) ? raw : []).map((t) =>
      typeof t === "string" ? t : String((t as { query?: string; term?: string }).query ?? (t as { term?: string }).term ?? ""),
    );
  },
};
