import Image from "next/image";
import type { CSSProperties } from "react";
import type { Machine } from "@/lib/pslaser/data";
import { WhatsAppButton } from "./button";
import styles from "./cards.module.css";

type MachineCardProps = {
  machine: Machine;
  /** Shown as "01", "02"… in the corner. */
  index?: number;
  /** Heading level for the machine name (default h3). */
  headingAs?: "h2" | "h3" | "h4";
  /** Stagger delay for the scroll reveal, in ms. */
  revealDelay?: number;
  /** Horizontal layout (image beside specs) from 600px up — use when the card spans 2 columns. */
  featured?: boolean;
  className?: string;
};

/** Machine spec card with a machine-specific WhatsApp quote CTA. */
export function MachineCard({
  machine,
  index,
  headingAs: H = "h3",
  revealDelay = 0,
  featured = false,
  className,
}: MachineCardProps) {
  const isFacility = machine.slug === "plc-powder-coating-plant";
  return (
    <article
      id={machine.slug}
      className={[styles.card, styles.machine, featured && styles.featured, className].filter(Boolean).join(" ")}
      data-reveal
      style={revealDelay ? ({ "--reveal-delay": `${revealDelay}ms` } as CSSProperties) : undefined}
    >
      <div className={`s-media ${styles.media} ${styles.machineMedia}`}>
        <Image
          src={machine.image}
          alt={machine.name}
          fill
          sizes="(min-width: 1200px) 33vw, (min-width: 700px) 50vw, 100vw"
        />
        {typeof index === "number" && (
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.kicker}>{machine.category}</p>
        <H className={`s-h3 ${styles.title}`}>{machine.name}</H>
        <ul className={styles.specs}>
          {machine.specs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className={styles.note}>
          {isFacility ? "Representative image" : "Manufacturer image"}
        </p>
        <div className={styles.foot}>
          <WhatsAppButton
            message={machine.quoteMessage}
            variant="secondary"
            size="sm"
            aria-label={`Get a quote for ${machine.shortName} on WhatsApp`}
          >
            Get quote
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
