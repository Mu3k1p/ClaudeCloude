import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toProfile, toUser } from "@/lib/api/adapters";
import type { Profile, Session, User } from "@/lib/types";

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    const raw = await api.post<Record<string, unknown>>(endpoints.auth.login(), { email, password });
    const token = (raw?.token ?? raw?.accessToken ?? raw?.access_token) as string | undefined;
    return { token, user: toUser(raw?.user ?? raw) };
  },
  logout: () => api.post<void>(endpoints.auth.logout()),
  async me(): Promise<User> {
    return toUser(await api.get(endpoints.auth.me()));
  },
  async profiles(): Promise<Profile[]> {
    const raw = await api.get<unknown[]>(endpoints.profiles.list());
    return (Array.isArray(raw) ? raw : []).map(toProfile);
  },
};
