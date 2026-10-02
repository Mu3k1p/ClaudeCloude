"use client";

import { useQuery } from "@tanstack/react-query";
import { Hero, HeroSkeleton } from "@/components/content/Hero";
import { ContentRail, RailRenderer } from "@/components/content/RailRenderer";
import { RailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { useContinueWatching, useMyList } from "@/hooks/useLibrary";
import { qk } from "@/lib/queryKeys";
import { contentService, profileService, recommendationsService } from "@/services";
import { useAuth } from "@/providers/AuthProvider";

export function HomeView() {
  const { activeProfile } = useAuth();
  const home = useQuery({ queryKey: qk.home(activeProfile?.id), queryFn: contentService.home });
  const continueWatching = useContinueWatching();
  const myList = useMyList();
  const recs = useQuery({ queryKey: qk.recommendations, queryFn: recommendationsService.forYou });
  const prefs = useQuery({ queryKey: qk.preferences, queryFn: profileService.preferences });

  if (home.isError) {
    return (
      <div className="gutter pt-32">
        <ErrorState error={home.error} onRetry={() => home.refetch()} title="We couldn't load your home feed" />
      </div>
    );
  }

  const rails = home.data?.rails ?? [];
  const [first, second, ...rest] = rails;

  return (
    <>
      {home.isPending ? <HeroSkeleton /> : <Hero items={home.data.featured} autoplayPreviews={prefs.data?.autoplayPreviews ?? true} />}

      {/* Pull the first rails up over the hero's fade for a continuous composition. */}
      <div className="relative z-10 -mt-6 space-y-1 md:-mt-14 md:space-y-2">
        {continueWatching.isPending ? (
          <RailSkeleton aspect="aspect-video" width="w-[74vw] sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw]" count={5} />
        ) : (
          continueWatching.data && continueWatching.data.length > 0 && (
            <ContentRail title="Continue watching" items={continueWatching.data} variant="landscape" showProgress />
          )
        )}

        {myList.data && myList.data.length > 0 && <ContentRail title="My collection" href="/library" items={myList.data} variant="poster" />}

        {home.isPending ? (
          <>
            <RailSkeleton />
            <RailSkeleton aspect="aspect-video" width="w-[74vw] sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw]" count={5} />
          </>
        ) : (
          <>
            {first && <RailRenderer rail={first} />}
            {second && <RailRenderer rail={second} />}
            {recs.data && recs.data.length > 0 && (
              <ContentRail title={`Recommended for ${activeProfile?.name ?? "you"}`} subtitle="Based on what you've watched and saved" items={recs.data} variant="landscape" />
            )}
            {rest.map((rail) => (
              <RailRenderer key={rail.id} rail={rail} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
