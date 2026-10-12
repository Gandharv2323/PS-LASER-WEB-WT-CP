"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./advanced.module.css";

const M = "/sites/pslaser";

const SLIDES = [
  { src: `${M}/gallery/laser-cutting-bg.jpg`, caption: "CNC Laser Cutting" },
  { src: `${M}/gallery/cnc-bending-bg.jpg`, caption: "CNC Bending" },
  { src: `${M}/gallery/fabrication-welding-bg.jpg`, caption: "Fabrication & Welding" },
  { src: `${M}/gallery/powder-coating-bg.jpg`, caption: "Powder Coating" },
] as const;

export function HeroSlides() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setActive((n) => (n + 1) % SLIDES.length), 5200);
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <div
      className={styles.slides}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label="PS Laser processes"
    >
      {SLIDES.map((s, i) => (
        <div key={s.src} className={styles.slide} data-active={i === active} aria-hidden={i !== active}>
          <Image
            src={s.src}
            alt={s.caption}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </div>
      ))}
      <div className={styles.slidesShade} />
      <div className={styles.slideCaption}>
        <span className={styles.slideLabel} aria-live="polite">
          {SLIDES[active].caption}
        </span>
        <div className={styles.slideDots}>
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={styles.slideDot}
              aria-label={`Show ${s.caption}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
