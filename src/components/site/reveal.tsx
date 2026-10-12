import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  /** "up" (default) | "fade" | "scale" | "left" */
  variant?: "up" | "fade" | "scale" | "left";
  /** Delay in ms (use for staggering siblings: index * 80). */
  delay?: number;
  className?: string;
  id?: string;
  children: ReactNode;
};

/**
 * Scroll-reveal wrapper (server-safe). It only sets `data-reveal`; the single
 * <RevealObserver/> mounted in the site layout does the observing. Any element can
 * also opt in with the bare attribute: <li data-reveal>…</li>.
 * Without JS or with prefers-reduced-motion, content is simply visible.
 */
export function Reveal({ as: Tag = "div", variant = "up", delay = 0, className, id, children }: RevealProps) {
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <Tag id={id} className={className} data-reveal={variant === "up" ? "" : variant} style={style}>
      {children}
    </Tag>
  );
}

/** Inline style for staggering bare `data-reveal` elements: style={revealDelay(i * 80)}. */
export function revealDelay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}
