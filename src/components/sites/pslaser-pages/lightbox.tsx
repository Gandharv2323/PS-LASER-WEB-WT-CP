"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type LightboxSlide = {
  key: string;
  title: string;
  caption?: string;
  content: ReactNode;
  /** Optional extra action under the caption (e.g. WhatsApp enquiry). */
  action?: ReactNode;
};

type LightboxProps = {
  slides: LightboxSlide[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  label?: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible lightbox: modal dialog in a portal, Esc closes, Left/Right navigate,
 * focus is trapped inside and returned to the opener, page scroll is locked.
 */
export function Lightbox({ slides, index, onClose, onIndexChange, label = "Image viewer" }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const open = index !== null && slides.length > 0;
  const count = slides.length;

  // Remember the opener, lock scroll, restore both on close.
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevPad = html.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    return () => {
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPad;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && count > 1) {
        e.preventDefault();
        onIndexChange((index + 1) % count);
      } else if (e.key === "ArrowLeft" && count > 1) {
        e.preventDefault();
        onIndexChange((index - 1 + count) % count);
      } else if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, count, onClose, onIndexChange]);

  if (!open || index === null) return null;
  const slide = slides[index];
  if (!slide) return null;

  return createPortal(
    <div className="psp-lightbox" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="psp-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${label}: ${slide.title}`}
      >
        <button ref={closeRef} type="button" className="psp-lb-btn psp-lb-close" onClick={onClose} aria-label="Close">
          <i className="bx bx-x" aria-hidden="true" />
        </button>
        {count > 1 ? (
          <>
            <button
              type="button"
              className="psp-lb-btn psp-lb-prev"
              onClick={() => onIndexChange((index - 1 + count) % count)}
              aria-label="Previous"
            >
              <i className="bx bx-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="psp-lb-btn psp-lb-next"
              onClick={() => onIndexChange((index + 1) % count)}
              aria-label="Next"
            >
              <i className="bx bx-chevron-right" aria-hidden="true" />
            </button>
          </>
        ) : null}
        <figure className="psp-lb-figure" key={slide.key}>
          <div className="psp-lb-media">{slide.content}</div>
          <figcaption>
            <strong>{slide.title}</strong>
            {slide.caption ? <span>{slide.caption}</span> : null}
            <em aria-live="polite">
              {index + 1} / {count}
            </em>
            {slide.action ? <div className="psp-lb-action">{slide.action}</div> : null}
          </figcaption>
        </figure>
      </div>
    </div>,
    document.body,
  );
}
