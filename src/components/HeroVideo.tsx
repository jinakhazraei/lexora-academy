"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "@/components/Icons";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
    setPlaying(true);
    setEnded(false);
  };

  return (
    <div className="relative aspect-video w-full max-w-[640px] overflow-hidden rounded-[20px] bg-navy">
      <video
        ref={videoRef}
        src="/video/hero-video.mp4"
        controls
        playsInline
        className="block h-full w-full object-cover"
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
      />
      {!playing && !ended && (
        <div
          onClick={play}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-navy/15"
        >
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/92 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <PlayIcon />
          </div>
        </div>
      )}
    </div>
  );
}
