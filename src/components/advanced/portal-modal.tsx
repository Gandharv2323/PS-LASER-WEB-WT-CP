"use client";

import { useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const noopSubscribe = () => () => {};

/**
 * Modal rendered through a portal into document.body, so it escapes parent overflow /
 * stacking contexts while staying in the React tree (context + events still bubble).
 */
export function PortalModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, true afterwards (no setState in an effect).
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // useLayoutEffect: lock scroll + move focus BEFORE the browser paints the dialog,
  // so there is no visible jump. (useEffect would run after paint.)
  useLayoutEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [open]);

  // useEffect is right for subscriptions that don't affect layout.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;
  return createPortal(
    <div className="ps-home ps-adv-modal-root">
      <div className="ps-adv-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={dialogRef} className="ps-adv-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="ps-adv-modal-head">
          <h4 id={titleId}>{title}</h4>
          <button type="button" className="ps-adv-icon-btn" onClick={onClose} aria-label="Close">
            <i className="bx bx-x" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
