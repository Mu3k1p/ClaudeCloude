"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { libraryService, progressService } from "@/services";
import { qk } from "@/lib/queryKeys";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Collection, Content } from "@/lib/types";

/** My List with optimistic add/remove. */
export function useMyList() {
  const { status } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: qk.myList, queryFn: libraryService.myList, enabled: status === "authenticated" });

  const mutation = useMutation({
    mutationFn: ({ item, add }: { item: Content; add: boolean }) =>
      add ? libraryService.addToList(item.id) : libraryService.removeFromList(item.id),
    onMutate: async ({ item, add }) => {
      await qc.cancelQueries({ queryKey: qk.myList });
      const prev = qc.getQueryData<Content[]>(qk.myList);
      qc.setQueryData<Content[]>(qk.myList, (old = []) =>
        add ? [item, ...old.filter((c) => c.id !== item.id)] : old.filter((c) => c.id !== item.id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.myList, ctx.prev);
      toast.error("Couldn't update your list. Try again in a moment.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.myList }),
  });

  const ids = new Set((query.data ?? []).map((c) => c.id));
  const has = (id: string) => ids.has(id);

  const toggle = useCallback(
    (item: Content) => {
      const add = !ids.has(item.id);
      mutation.mutate({ item, add });
      toast.show(add ? `Added to My List` : `Removed from My List`, {
        tone: add ? "success" : "neutral",
        action: { label: "Undo", onClick: () => mutation.mutate({ item, add: !add }) },
      });
    },
    [ids, mutation, toast],
  );

  return { ...query, has, toggle };
}

export function useSavedCollections() {
  const { status } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const query = useQuery({
    queryKey: qk.savedCollections,
    queryFn: libraryService.savedCollections,
    enabled: status === "authenticated",
  });
  const mutation = useMutation({
    mutationFn: ({ c, save }: { c: Collection; save: boolean }) =>
      save ? libraryService.saveCollection(c.id) : libraryService.unsaveCollection(c.id),
    onMutate: async ({ c, save }) => {
      await qc.cancelQueries({ queryKey: qk.savedCollections });
      const prev = qc.getQueryData<Collection[]>(qk.savedCollections);
      qc.setQueryData<Collection[]>(qk.savedCollections, (old = []) =>
        save ? [c, ...old.filter((x) => x.id !== c.id)] : old.filter((x) => x.id !== c.id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.savedCollections, ctx.prev);
      toast.error("Couldn't update saved collections.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.savedCollections }),
  });
  const isSaved = (id: string) => (query.data ?? []).some((c) => c.id === id);
  const toggle = (c: Collection) => {
    const save = !isSaved(c.id);
    mutation.mutate({ c, save });
    toast.show(save ? "Collection saved" : "Collection removed", { tone: save ? "success" : "neutral" });
  };
  return { ...query, isSaved, toggle };
}

/** Continue Watching items, with progress folded into the content objects. */
export function useContinueWatching() {
  const { status } = useAuth();
  return useQuery({
    queryKey: qk.progress,
    queryFn: progressService.continueWatching,
    enabled: status === "authenticated",
    select: (rows) =>
      rows
        .filter((r) => r.content)
        .map((r) => ({
          ...r.content!,
          progress: r.durationSeconds ? r.positionSeconds / r.durationSeconds : r.content!.progress,
        })),
  });
}
