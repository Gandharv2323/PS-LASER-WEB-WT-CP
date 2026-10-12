import type { CSSProperties } from "react";
import { equipmentBrands } from "@/lib/pslaser/data";
import type { Tone } from "./section";
import styles from "./brand-strip.module.css";

type BrandStripProps = {
  tone?: Tone;
  eyebrow?: string;
  title?: string;
  /** Show the one-line "what we run" note under each brand (default true). */
  notes?: boolean;
  id?: string;
};

/**
 * Text wordmarks of the equipment brands PS Laser runs (HSG Laser, Amada, Genesis,
 * Wagner). Plain type, not logos — and worded as equipment, not partnerships.
 */
export function BrandStrip({
  tone = "ink-2",
  eyebrow = "Equipment we run",
  title = "Powered by precision. Built for performance.",
  notes = true,
  id = "equipment",
}: BrandStripProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className={`s-section s-section--tight s-tone-${tone}`} aria-labelledby={titleId}>
      <div className="s-container">
        <div className={styles.head} data-reveal>
          <p className="s-eyebrow">{eyebrow}</p>
          <h2 id={titleId} className={`s-h3 ${styles.title}`}>
            {title}
          </h2>
        </div>
        <ul className={styles.list}>
          {equipmentBrands.map((b, i) => (
            <li
              key={b.name}
              className={styles.item}
              data-reveal="fade"
              style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties}
            >
              <span className={styles.word} data-brand={b.name}>
                {b.name}
              </span>
              {notes && <span className={styles.note}>{b.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
