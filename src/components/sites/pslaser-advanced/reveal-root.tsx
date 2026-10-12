"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./advanced.module.css";

type Props = { className?: string; children: ReactNode };

/**
 * Page root. Turns on scroll-reveal once JS runs (content stays visible
 * without JS) and marks every [data-reveal] element with [data-shown]
 * when it scrolls into view.
 */
export function RevealRoot({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    root.setAttribute("data-js", "on");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.root} ${className ?? ""}`}>
      {children}
    </div>
  );
}
