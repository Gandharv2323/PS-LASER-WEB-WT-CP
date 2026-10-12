"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "./use-scroll-lock";
import styles from "./lightbox.module.css";

export type GalleryItem = {
  src: string;
  alt: string;
  /** Short title shown on the tile and in the lightbox. */
  title?: string;
  /** Honest label, e.g. "Representative work". */
  caption?: string;
  /** Small category tag, e.g. "Laser cutting". */
  tag?: string;
};

type LightboxProps = {
  items: GalleryItem[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Accessible modal image viewer: Esc closes, ←/→ navigate, focus is trapped and
 * returned to the opener, page scroll is locked. Controlled component.
 */
export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  useScrollLock(open);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button"));
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go, onClose]);

  if (!open || index === null) return null;
  const item = items[index];
  // Portal into .s-root (keeps fonts/tokens, escapes transformed ancestors).
  const host = document.querySelector(".s-root") ?? document.body;

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? item.alt}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button ref={closeRef} type="button" className={`${styles.ctrl} ${styles.close}`} onClick={onClose} aria-label="Close">
        <X aria-hidden="true" />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className={`${styles.ctrl} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className={`${styles.ctrl} ${styles.next}`} onClick={() => go(1)} aria-label="Next image">
            <ChevronRight aria-hidden="true" />
          </button>
        </>
      )}
      <figure className={styles.figure} key={item.src}>
        <div className={styles.imgWrap}>
          <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 80vw, 100vw" />
        </div>
        <figcaption className={styles.caption}>
          <span>
            {item.title && <strong>{item.title}</strong>}
            {item.caption && <span className={styles.capNote}>{item.caption}</span>}
          </span>
          <span className={styles.count}>
            {index + 1} / {items.length}
          </span>
        </figcaption>
      </figure>
    </div>,
    host,
  );
}

type GalleryGridProps = {
  items: GalleryItem[];
  /** Min column width in px for the responsive grid (default 260). */
  minColumn?: number;
  /** Tile aspect ratio (default "1 / 1"). */
  ratio?: string;
  /** Make the first tile span 2×2 on wide screens (default false). */
  feature?: boolean;
  className?: string;
};

/** Responsive image grid whose tiles open the shared Lightbox. */
export function GalleryGrid({ items, minColumn = 260, ratio = "1 / 1", feature = false, className }: GalleryGridProps) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  return (
    <>
      <ul
        className={[styles.grid, feature && styles.featured, className].filter(Boolean).join(" ")}
        style={{ "--min": `${minColumn}px` } as CSSProperties}
      >
        {items.map((item, i) => (
          <li
            key={item.src}
            className={styles.tileItem}
            data-reveal="fade"
            style={{ "--reveal-delay": `${(i % 4) * 80}ms` } as CSSProperties}
          >
            <button
              type="button"
              className={styles.tile}
              onClick={(e) => {
                // Ensure the opener has focus so the Lightbox can return focus to it.
                e.currentTarget.focus();
                setIndex(i);
              }}
              aria-label={`View larger: ${item.title ?? item.alt}`}
            >
              <span className={`s-media ${styles.tileMedia}`} style={{ "--ratio": ratio } as CSSProperties}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={`(min-width: 1200px) 25vw, (min-width: 640px) 50vw, 100vw`}
                />
              </span>
              <span className={styles.tileInfo}>
                <span>
                  {item.tag && <span className={styles.tag}>{item.tag}</span>}
                  {item.title && <span className={styles.tileTitle}>{item.title}</span>}
                  {item.caption && <span className={styles.tileCap}>{item.caption}</span>}
                </span>
                <Expand className={styles.expand} aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={index} onClose={close} onIndexChange={setIndex} />
    </>
  );
}
