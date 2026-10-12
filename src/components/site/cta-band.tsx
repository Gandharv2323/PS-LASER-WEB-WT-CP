import type { ReactNode } from "react";
import { GENERAL_QUOTE_MESSAGE } from "@/lib/pslaser/data";
import { Button, WhatsAppButton } from "./button";
import styles from "./cta-band.module.css";

type CTABandProps = {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  /** WhatsApp pre-filled message for the primary CTA. */
  message?: string;
  primaryLabel?: string;
  /** Optional secondary link (internal route, tel:, mailto:, or URL). */
  secondary?: { href: string; label: string };
  /** "accent" = orange band (default), "ink" = dark band. */
  tone?: "accent" | "ink";
  id?: string;
};

/** Full-width call-to-action band with a WhatsApp quote button. */
export function CTABand({
  eyebrow,
  title,
  text,
  message = GENERAL_QUOTE_MESSAGE,
  primaryLabel = "Get a quote on WhatsApp",
  secondary,
  tone = "accent",
  id,
}: CTABandProps) {
  return (
    <section id={id} className={`${styles.band} ${tone === "ink" ? "s-tone-ink" : styles.accent}`}>
      <div className={`s-container ${styles.inner}`} data-reveal>
        <div className={styles.copy}>
          {eyebrow && <p className={`s-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
          <h2 className={`s-h2 ${styles.title}`}>{title}</h2>
          {text && <div className={styles.text}>{text}</div>}
        </div>
        <div className={`s-btn-row s-btn-row--stack ${styles.actions}`}>
          <WhatsAppButton message={message} size="lg" variant={tone === "accent" ? "dark" : "primary"}>
            {primaryLabel}
          </WhatsAppButton>
          {secondary && (
            <Button href={secondary.href} size="lg" variant={tone === "accent" ? "secondary" : "light"}>
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
