"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-media-query";
import styles from "./hero-video.module.css";

type HeroVideoProps = {
  src: string;
  poster: string;
  posterAlt?: string;
  className?: string;
};

/**
 * Full-bleed background video (muted, looped, inline) over a priority poster image.
 * With prefers-reduced-motion the video is never mounted — only the poster shows.
 * Includes a pause/play control (WCAG 2.2.2).
 */
export function HeroVideo({ src, poster, posterAlt = "", className }: HeroVideoProps) {
  const allowMotion = !usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <Image src={poster} alt={posterAlt} fill priority sizes="100vw" className={styles.poster} />
      {allowMotion && (
        <video
          ref={videoRef}
          className={styles.video}
          data-ready={ready}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
        />
      )}
      {allowMotion && (
        <button
          type="button"
          className={styles.control}
          onClick={toggle}
          aria-label={paused ? "Play background video" : "Pause background video"}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
