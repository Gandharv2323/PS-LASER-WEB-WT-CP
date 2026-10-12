"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { products, whatsapp } from "@/lib/pslaser/data";
import styles from "./advanced.module.css";

/** Main process behind each product type (from the PS Laser portfolio categories). */
const PROCESS: Record<string, string> = {
  "Industrial Enclosures": "Laser Cutting",
  "Control Panel Housings": "Sheet Metal",
  "Precision Brackets": "CNC Bending",
  "Machine Guards": "Fabrication",
  "Custom Fixtures": "Welding",
  "Powder Coated Parts": "Powder Coating",
  "Laser Cut Jaali Patterns": "Laser Cutting",
  "Structural Fabrication": "Fabrication",
};

const DURATION = 7000;

function productQuoteMessage(title: string): string {
  return `Hi PS Laser, I need a quote for ${title}. Material: ___, Size/drawing: ___, Quantity: ___.`;
}

export function WorkSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = products.length;

  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  const onDotEnd = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    go(i + 1);
  };

  return (
    <div
      className={styles.tWrap}
      data-paused={paused}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Products we manufacture"
      style={{ ["--t-dur" as string]: `${DURATION}ms` }}
    >
      <div className={styles.tStage} aria-live="polite">
        {products.map((p, k) => (
          <figure
            key={p.title}
            className={`${styles.tSlide} ${styles.workSlide}`}
            data-active={k === i}
            aria-hidden={k !== i}
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}`}
          >
            <div className={styles.workMedia}>
              <Image src={p.image} alt={p.title} fill sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
            <figcaption className={styles.workBody}>
              <span className={styles.workCount}>
                {String(k + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
              <span className={styles.workTag}>{PROCESS[p.title] ?? "Sheet Metal"}</span>
              <h3 className={styles.workTitle}>{p.title}</h3>
              <p className={styles.workText}>
                Made in-house at our Velu, Pune plant — cut, formed, welded and finished to your drawing.
              </p>
              <a
                className={styles.btn}
                href={whatsapp(productQuoteMessage(p.title))}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={k === i ? undefined : -1}
              >
                Get Quote on WhatsApp <ArrowRight aria-hidden />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.tControls}>
        <div className={styles.tDots}>
          {products.map((p, k) => (
            <button
              key={k === i ? `${p.title}-on` : p.title}
              type="button"
              className={styles.tDot}
              aria-label={`Show ${p.title}`}
              aria-current={k === i}
              onClick={() => go(k)}
              onAnimationEnd={k === i ? onDotEnd : undefined}
            />
          ))}
        </div>
        <div className={styles.tArrows}>
          <button type="button" className={styles.tArrow} aria-label="Previous product" onClick={() => go(i - 1)}>
            <ChevronLeft />
          </button>
          <button type="button" className={styles.tArrow} aria-label="Next product" onClick={() => go(i + 1)}>
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
