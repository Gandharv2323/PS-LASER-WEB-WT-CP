import type { ReactNode } from "react";
import styles from "./section.module.css";

export type Tone = "paper" | "paper-2" | "white" | "ink" | "ink-2";

type SectionProps = {
  id?: string;
  tone?: Tone;
  /** Vertical padding. "default" = --section-y, "tight" = --section-y-tight, "none" = 0. */
  spacing?: "default" | "tight" | "none";
  /** Skip the inner .s-container (for full-bleed content). */
  bleed?: boolean;
  /** Use the narrow (880px) container. */
  narrow?: boolean;
  /** Draws a hairline at the top of the section, inside the container. */
  ruled?: boolean;
  className?: string;
  containerClassName?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
};

/** Page band: tone background + vertical rhythm + container. */
export function Section({
  id,
  tone = "paper",
  spacing = "default",
  bleed = false,
  narrow = false,
  ruled = false,
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  const cls = [
    "s-section",
    spacing === "tight" && "s-section--tight",
    spacing === "none" && "s-section--flush",
    `s-tone-${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const containerCls = ["s-container", narrow && "s-container--narrow", containerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={cls} {...rest}>
      {bleed ? (
        children
      ) : (
        <div className={containerCls}>
          {ruled && <hr className={`s-rule ${styles.topRule}`} />}
          {children}
        </div>
      )}
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Heading element. Default "h2". */
  as?: "h1" | "h2" | "h3";
  /** "split" puts the title left and intro/action right on desktop. */
  layout?: "stack" | "split" | "center";
  /** Optional element (usually a Button) shown beside/below the intro. */
  action?: ReactNode;
  id?: string;
  className?: string;
};

/** Eyebrow + big uppercase display title + optional intro and action. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  layout = "stack",
  action,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={[styles.heading, styles[layout], className].filter(Boolean).join(" ")}
      data-reveal
    >
      <div className={styles.titleCol}>
        {eyebrow && <p className="s-eyebrow">{eyebrow}</p>}
        <Tag id={id} className={`s-h2 ${styles.title}`}>
          {title}
        </Tag>
      </div>
      {(intro || action) && (
        <div className={styles.introCol}>
          {intro && <div className="s-lead">{intro}</div>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
    </header>
  );
}
