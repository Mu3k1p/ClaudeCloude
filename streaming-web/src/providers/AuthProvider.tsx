"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services";
import { onUnauthorized } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import { config } from "@/lib/config";
import type { Profile, User } from "@/lib/types";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: Status;
  user: User | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  /** True when the account has several profiles and none is chosen yet. */
  needsProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectProfile: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const loadProfiles = useCallback(async (u: User) => {
    // Prefer profiles embedded in the user payload; otherwise ask the profiles endpoint.
    // Accounts without profile support simply end up with an empty list.
    let list = u.profiles ?? [];
    if (!list.length) list = await authService.profiles().catch(() => []);
    setProfiles(list);
    const stored = tokenStore.getProfileId();
    const valid = list.find((p) => p.id === stored);
    const auto = valid ?? (list.length === 1 ? list[0] : null);
    setActiveProfileId(auto?.id ?? null);
    tokenStore.setProfileId(auto?.id ?? null);
  }, []);

  const reset = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setProfiles([]);
    setActiveProfileId(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  // Restore session on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (config.authStrategy === "bearer" && !tokenStore.getToken()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const u = await authService.me();
        if (cancelled) return;
        setUser(u);
        await loadProfiles(u);
        if (!cancelled) setStatus("authenticated");
      } catch {
        if (!cancelled) reset();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfiles, reset]);

  useEffect(() => onUnauthorized(reset), [reset]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authService.login(email, password);
      if (session.token) tokenStore.setToken(session.token);
      // Some backends return a minimal user on login; fetch the full one.
      const u = session.user.id ? session.user : await authService.me();
      setUser(u);
      await loadProfiles(u);
      setStatus("authenticated");
    },
    [loadProfiles],
  );

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    reset();
  }, [reset]);

  const selectProfile = useCallback(
    (id: string) => {
      tokenStore.setProfileId(id);
      setActiveProfileId(id);
      // Profile-scoped data (list, progress, recommendations) must refetch.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" || q.queryKey.length > 1 });
    },
    [queryClient],
  );

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profiles,
      activeProfile,
      needsProfile: status === "authenticated" && profiles.length > 1 && !activeProfile,
      login,
      logout,
      selectProfile,
    }),
    [status, user, profiles, activeProfile, login, logout, selectProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
