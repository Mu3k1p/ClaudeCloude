import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toCollection, toContent, toHistoryEntry, toPaginated, toProgress } from "@/lib/api/adapters";
import type { Collection, Content, HistoryEntry, WatchProgress } from "@/lib/types";

const items = <T,>(raw: unknown, map: (x: unknown) => T) => toPaginated(raw, map).items;

/** My List, saved collections and watch history. */
export const libraryService = {
  async myList(): Promise<Content[]> {
    return items(await api.get(endpoints.me.list()), toContent);
  },
  addToList: (contentId: string) => api.put<void>(endpoints.me.listItem(contentId)),
  removeFromList: (contentId: string) => api.del<void>(endpoints.me.listItem(contentId)),

  async history(): Promise<HistoryEntry[]> {
    return items(await api.get(endpoints.me.history()), toHistoryEntry);
  },

  async savedCollections(): Promise<Collection[]> {
    return items(await api.get(endpoints.me.collections()), toCollection);
  },
  saveCollection: (id: string) => api.put<void>(endpoints.me.collectionItem(id)),
  unsaveCollection: (id: string) => api.del<void>(endpoints.me.collectionItem(id)),
};

/** Continue watching and resume points. */
export const progressService = {
  async continueWatching(): Promise<WatchProgress[]> {
    return items(await api.get(endpoints.me.progress()), toProgress);
  },
  save: (contentId: string, positionSeconds: number, durationSeconds: number) =>
    api.put<void>(endpoints.me.progressItem(contentId), {
      positionSeconds: Math.floor(positionSeconds),
      durationSeconds: Math.floor(durationSeconds),
    }),
};
