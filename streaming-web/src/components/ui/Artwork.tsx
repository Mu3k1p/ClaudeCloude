"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { config } from "@/lib/config";

interface ArtworkProps {
  src?: string;
  alt: string;
  /** Used for the graceful fallback when there's no image or it fails. */
  title?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  quality?: 60 | 75 | 85;
}

function canOptimise(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return config.imageHosts.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * Lazy-loaded image that fills its (relatively positioned) parent.
 * Fades in when decoded; falls back to a tonal plate with the title if the
 * image is missing or fails, so a broken CDN never shows a broken icon.
 */
export function Artwork({ src, alt, title, sizes = "33vw", priority, className, imgClassName, quality = 75 }: ArtworkProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-elevated", className)}>
      {showFallback ? (
        <div className="absolute inset-0 flex items-end bg-[radial-gradient(120%_90%_at_20%_10%,#24221f_0%,#141416_55%,#0e0e10_100%)] p-[8%]">
          {title && <span className="line-clamp-3 text-balance text-[clamp(0.8rem,2.4cqw,1.25rem)] font-medium leading-tight text-ink-soft/80">{title}</span>}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          unoptimized={!canOptimise(src)}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-[opacity,transform,filter] duration-700 ease-[var(--ease-cinema)]",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
