import type { CardVariant, ContentKind } from "@/lib/types";

export const ASPECT: Record<CardVariant, string> = {
  poster: "aspect-[2/3]",
  landscape: "aspect-video",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  wide: "aspect-[21/9]",
};

/** Card widths inside horizontal rails, per breakpoint. */
export const RAIL_WIDTH: Record<CardVariant, string> = {
  poster: "w-[40vw] sm:w-[27vw] md:w-[20vw] lg:w-[15vw] 2xl:w-[12.4vw]",
  landscape: "w-[74vw] sm:w-[44vw] md:w-[31vw] lg:w-[23.5vw] 2xl:w-[19vw]",
  portrait: "w-[50vw] sm:w-[32vw] md:w-[24vw] lg:w-[18vw] 2xl:w-[15vw]",
  square: "w-[46vw] sm:w-[30vw] md:w-[22vw] lg:w-[16vw] 2xl:w-[13vw]",
  wide: "w-[86vw] sm:w-[62vw] md:w-[46vw] lg:w-[37vw] 2xl:w-[30vw]",
};

export const SIZES: Record<CardVariant, string> = {
  poster: "(min-width:1024px) 16vw, (min-width:640px) 27vw, 40vw",
  landscape: "(min-width:1024px) 24vw, (min-width:640px) 44vw, 74vw",
  portrait: "(min-width:1024px) 18vw, (min-width:640px) 32vw, 50vw",
  square: "(min-width:1024px) 16vw, (min-width:640px) 30vw, 46vw",
  wide: "(min-width:1024px) 37vw, (min-width:640px) 62vw, 86vw",
};

const DEFAULT_BY_KIND: Record<ContentKind, CardVariant> = {
  movie: "poster",
  series: "poster",
  documentary: "poster",
  short: "landscape",
  photography: "portrait",
  event: "wide",
  episode: "landscape",
  other: "landscape",
};

export const variantFor = (kind: ContentKind): CardVariant => DEFAULT_BY_KIND[kind] ?? "landscape";
