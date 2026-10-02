"use client";

import { useId } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/providers/ToastProvider";
import { qk } from "@/lib/queryKeys";
import { profileService } from "@/services";
import type { Preferences } from "@/lib/types";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "km", label: "ខ្មែរ · Khmer" },
  { value: "fr", label: "Français" },
];
const SUBTITLES = [{ value: "off", label: "Off" }, ...LANGUAGES];
const QUALITIES = [
  { value: "auto", label: "Automatic" },
  { value: "2160p", label: "4K (2160p)" },
  { value: "1080p", label: "High (1080p)" },
  { value: "720p", label: "Standard (720p)" },
];

export function PreferencesForm() {
  const qc = useQueryClient();
  const toast = useToast();
  const prefs = useQuery({ queryKey: qk.preferences, queryFn: profileService.preferences });

  const save = useMutation({
    mutationFn: (patch: Partial<Preferences>) => profileService.updatePreferences(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: qk.preferences });
      const prev = qc.getQueryData<Preferences>(qk.preferences);
      if (prev) qc.setQueryData(qk.preferences, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.preferences, ctx.prev);
      toast.error("Couldn't save your preferences.");
    },
    onSuccess: (data) => {
      qc.setQueryData(qk.preferences, data);
      toast.success("Preferences saved");
    },
  });

  if (prefs.isPending)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  if (prefs.isError) return <ErrorState error={prefs.error} onRetry={() => prefs.refetch()} />;

  const p = prefs.data;
  return (
    <div className="divide-y divide-line border-y border-line">
      <Select label="Display language" value={p.language} options={LANGUAGES} onChange={(language) => save.mutate({ language })} />
      <Select label="Subtitles" description="Default subtitle language when a track is available." value={p.subtitleLanguage} options={SUBTITLES} onChange={(subtitleLanguage) => save.mutate({ subtitleLanguage })} />
      <Select label="Playback quality" value={p.defaultQuality} options={QUALITIES} onChange={(defaultQuality) => save.mutate({ defaultQuality })} />
      <Switch label="Autoplay next" description="Start the next episode or recommended title when one ends." checked={p.autoplayNext} onChange={(autoplayNext) => save.mutate({ autoplayNext })} />
      <Switch label="Autoplay previews" description="Play muted trailers on the home screen." checked={p.autoplayPreviews} onChange={(autoplayPreviews) => save.mutate({ autoplayPreviews })} />
      <Switch label="Data saver" description="Prefer lower bitrates on mobile networks." checked={p.dataSaver} onChange={(dataSaver) => save.mutate({ dataSaver })} />
    </div>
  );
}

function Select({ label, description, value, options, onChange }: { label: string; description?: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <label htmlFor={id} className="text-[14.5px] text-ink">{label}</label>
        {description && <p className="mt-1 text-[13px] text-ink-muted">{description}</p>}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[5px] border border-line bg-surface px-3 text-[13.5px] text-ink focus:border-accent/60 focus:outline-none sm:w-56"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
