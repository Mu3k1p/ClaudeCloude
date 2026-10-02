"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Check, LogOut } from "lucide-react";
import { Avatar } from "@/components/layout/ProfileMenu";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { ContentRail } from "@/components/content/RailRenderer";
import { Button } from "@/components/ui/Button";
import { useContinueWatching, useMyList, useSavedCollections } from "@/hooks/useLibrary";
import { useAuth } from "@/providers/AuthProvider";
import { qk } from "@/lib/queryKeys";
import { libraryService } from "@/services";
import { cn } from "@/lib/cn";

export function ProfileView() {
  const { user, profiles, activeProfile, selectProfile, logout } = useAuth();
  const router = useRouter();
  const myList = useMyList();
  const cw = useContinueWatching();
  const saved = useSavedCollections();
  const history = useQuery({ queryKey: qk.history, queryFn: libraryService.history });

  const name = activeProfile?.name ?? user?.name ?? "Member";
  const finished = history.data?.filter((h) => h.progress >= 0.95).length;
  const since = user?.memberSince ? new Date(user.memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : undefined;

  const stats = [
    { label: "In My List", value: myList.data?.length, href: "/library" },
    { label: "In progress", value: cw.data?.length, href: "/library?tab=continue" },
    { label: "Finished", value: finished, href: "/library?tab=history" },
    { label: "Collections saved", value: saved.data?.length, href: "/library?tab=collections" },
  ];

  return (
    <div className="pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      {/* Identity */}
      <header className="gutter">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-5 md:gap-8">
            <Avatar src={activeProfile?.avatar ?? user?.avatar} name={name} square className="size-20 md:size-28" />
            <div>
              <p className="eyebrow">{activeProfile ? "Profile" : "Account"}</p>
              <h1 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]">{name}</h1>
              <p className="mt-2 text-[13.5px] text-ink-muted">
                {user?.email}
                {since && <span className="text-ink-faint"> · Member since {since}</span>}
              </p>
            </div>
          </div>
          {user?.plan && (
            <p className="inline-flex items-center gap-2 self-start rounded-full border border-accent/40 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent md:self-auto">
              {user.plan}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <dl className="mt-12 grid grid-cols-2 border-y border-line md:mt-16 md:grid-cols-4">
          {stats.map((s, i) => (
            <Link key={s.label} href={s.href} className={cn("group py-6 md:py-8", i % 2 === 1 && "border-l border-line pl-5 md:pl-8", i >= 2 && "border-t border-line md:border-t-0", i === 2 && "md:border-l md:pl-8")}>
              <dd className="font-mono text-3xl text-ink tabular transition-colors group-hover:text-accent md:text-4xl">{s.value != null ? String(s.value).padStart(2, "0") : "—"}</dd>
              <dt className="mt-2 text-[13px] text-ink-muted">{s.label}</dt>
            </Link>
          ))}
        </dl>
      </header>

      {myList.data && myList.data.length > 0 && (
        <div className="mt-10">
          <ContentRail title="Saved to My List" href="/library" items={myList.data} variant="poster" />
        </div>
      )}

      <div className="gutter mt-12 grid gap-16 md:mt-16 lg:grid-cols-[1fr_380px] lg:gap-24">
        <section aria-labelledby="prefs">
          <h2 id="prefs" className="text-xl font-medium tracking-tight">Viewing preferences</h2>
          <p className="mb-6 mt-2 text-[13.5px] text-ink-muted">Saved to {activeProfile ? `the ${activeProfile.name} profile` : "your account"} across devices.</p>
          <PreferencesForm />
        </section>

        <div className="space-y-14">
          {profiles.length > 1 && (
            <section aria-labelledby="profiles-h">
              <h2 id="profiles-h" className="mb-5 text-xl font-medium tracking-tight">Profiles</h2>
              <ul className="divide-y divide-line border-y border-line">
                {profiles.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectProfile(p.id)}
                      aria-pressed={p.id === activeProfile?.id}
                      className="group flex w-full items-center gap-4 py-3.5 text-left"
                    >
                      <Avatar src={p.avatar} name={p.name} className="size-10" />
                      <span className="flex-1 text-[14.5px] text-ink-soft group-hover:text-ink">{p.name}</span>
                      {p.id === activeProfile?.id ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-accent">
                          <Check className="size-3.5" strokeWidth={2} aria-hidden /> Active
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">Switch</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="account-h">
            <h2 id="account-h" className="mb-5 text-xl font-medium tracking-tight">Account</h2>
            <dl className="divide-y divide-line border-y border-line text-[13.5px]">
              <div className="flex justify-between gap-4 py-3.5">
                <dt className="text-ink-faint">Email</dt>
                <dd className="truncate text-ink-soft">{user?.email}</dd>
              </div>
              {user?.plan && (
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink-faint">Plan</dt>
                  <dd className="text-ink-soft">{user.plan}</dd>
                </div>
              )}
            </dl>
            <Button
              variant="outline"
              className="mt-6"
              icon={<LogOut strokeWidth={1.5} />}
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
            >
              Sign out
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
