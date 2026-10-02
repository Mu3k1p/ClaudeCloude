import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toCollection } from "@/lib/api/adapters";
import type { Collection } from "@/lib/types";

export const collectionsService = {
  async list(): Promise<Collection[]> {
    const raw = await api.get(endpoints.collections.list());
    return (Array.isArray(raw) ? raw : []).map(toCollection);
  },
  async detail(slug: string): Promise<Collection> {
    return toCollection(await api.get(endpoints.collections.detail(slug)));
  },
};
