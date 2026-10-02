"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { PlaybackSource } from "@/lib/types";

export interface QualityOption {
  /** -1 = automatic (adaptive). For MP4 renditions this is the source index. */
  id: number;
  label: string;
}

/**
 * Attaches a playback source to a <video>.
 * - HLS: native where supported (Safari/iOS), hls.js elsewhere (lazy-loaded).
 *   Quality options come from the manifest's levels.
 * - MP4: one or more progressive renditions; switching keeps the playhead.
 */
export function useVideoSource(video: HTMLVideoElement | null, sources: PlaybackSource[], startAt = 0) {
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [quality, setQualityState] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [mp4Index, setMp4Index] = useState(0);

  const hlsSource = sources.find((s) => s.type === "hls");
  const mp4Sources = sources.filter((s) => s.type === "mp4");

  useEffect(() => {
    if (!video) return;
    setError(null);
    let cancelled = false;
    const resumeAt = video.currentTime > 0 ? video.currentTime : startAt;

    const seekOnLoad = () => {
      if (resumeAt > 0 && Number.isFinite(video.duration) && resumeAt < video.duration - 5) video.currentTime = resumeAt;
    };
    video.addEventListener("loadedmetadata", seekOnLoad, { once: true });

    if (hlsSource) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsSource.url;
      } else {
        import("hls.js").then(({ default: HlsCtor }) => {
          if (cancelled) return;
          if (!HlsCtor.isSupported()) {
            setError("This browser can't play this stream.");
            return;
          }
          const hls = new HlsCtor({ capLevelToPlayerSize: true, startPosition: resumeAt || -1 });
          hlsRef.current = hls;
          hls.loadSource(hlsSource.url);
          hls.attachMedia(video);
          hls.on(HlsCtor.Events.MANIFEST_PARSED, (_e, data) => {
            const levels = data.levels
              .map((l, i) => ({ id: i, label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)} kbps`, h: l.height ?? 0 }))
              .sort((a, b) => b.h - a.h);
            setQualities(levels.length > 1 ? [{ id: -1, label: "Auto" }, ...levels.map(({ id, label }) => ({ id, label }))] : []);
          });
          hls.on(HlsCtor.Events.ERROR, (_e, data) => {
            if (!data.fatal) return;
            if (data.type === HlsCtor.ErrorTypes.NETWORK_ERROR) hls.startLoad();
            else if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
            else setError("Playback failed. Please try again.");
          });
        });
      }
    } else if (mp4Sources.length) {
      video.src = mp4Sources[Math.min(mp4Index, mp4Sources.length - 1)].url;
      setQualities(
        mp4Sources.length > 1 ? mp4Sources.map((s, i) => ({ id: i, label: s.quality ?? `Source ${i + 1}` })) : [],
      );
    } else {
      setError(sources.some((s) => s.type === "dash") ? "DASH streams need a DASH player (e.g. dash.js or Shaka). See README." : "No playable source was returned for this title.");
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", seekOnLoad);
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [video, hlsSource?.url, mp4Sources.map((s) => s.url).join("|"), mp4Index]);

  const setQuality = (id: number) => {
    setQualityState(id);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = id;
    } else if (mp4Sources.length > 1 && video) {
      // The source effect restores the playhead; we only need to resume playback.
      const wasPlaying = !video.paused;
      setMp4Index(id);
      if (wasPlaying) video.addEventListener("loadedmetadata", () => video.play().catch(() => {}), { once: true });
    }
  };

  return { qualities, quality: hlsRef.current ? quality : mp4Sources.length > 1 ? mp4Index : quality, setQuality, error };
}
