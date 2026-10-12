import type { CSSProperties } from "react";
import { materials } from "@/lib/pslaser/data";
import styles from "./material-capacity.module.css";

type MaterialCapacityProps = {
  /** Caption under the bars. */
  note?: string;
  className?: string;
};

/**
 * Laser-cutting thickness capacity per material (MS 16 / SS 12 / Al 8 / Brass 4 /
 * Cu 4 mm) as proportional bars. Bars grow in when revealed. Works on any tone.
 */
export function MaterialCapacity({
  note = "Maximum cutting thickness on our fiber lasers. Achievable thickness depends on grade and edge-quality requirements.",
  className,
}: MaterialCapacityProps) {
  const max = Math.max(...materials.map((m) => parseFloat(m.max)));
  return (
    <figure className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <ul className={styles.list}>
        {materials.map((m, i) => {
          const value = parseFloat(m.max);
          return (
            <li
              key={m.name}
              className={styles.row}
              data-reveal="fade"
              style={{ "--reveal-delay": `${i * 90}ms`, "--pct": `${(value / max) * 100}%` } as CSSProperties}
            >
              <span className={styles.name}>{m.name}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={styles.bar} />
              </span>
              <span className={styles.value}>
                {value}
                <small> mm</small>
              </span>
            </li>
          );
        })}
      </ul>
      {note && <figcaption className={styles.note}>{note}</figcaption>}
    </figure>
  );
}
