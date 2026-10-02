import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toContent, toPaginated, toPreferences } from "@/lib/api/adapters";
import type { Content, Preferences } from "@/lib/types";

export const profileService = {
  async preferences(): Promise<Preferences> {
    return toPreferences(await api.get(endpoints.me.preferences()));
  },
  async updatePreferences(patch: Partial<Preferences>): Promise<Preferences> {
    return toPreferences(await api.patch(endpoints.me.preferences(), patch));
  },
};

export const recommendationsService = {
  async forYou(): Promise<Content[]> {
    return toPaginated(await api.get(endpoints.me.recommendations()), toContent).items;
  },
};
