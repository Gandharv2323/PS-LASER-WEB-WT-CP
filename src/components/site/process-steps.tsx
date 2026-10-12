import type { CSSProperties } from "react";
import { process } from "@/lib/pslaser/data";
import styles from "./process-steps.module.css";

type Step = { title: string; text: string };

type ProcessStepsProps = {
  /** Defaults to the 6-step manufacturing flow from data.ts. */
  steps?: Step[];
  className?: string;
};

/** Numbered process timeline: horizontal rule-grid on desktop, vertical on mobile. */
export function ProcessSteps({ steps = process, className }: ProcessStepsProps) {
  return (
    <ol className={[styles.list, className].filter(Boolean).join(" ")}>
      {steps.map((s, i) => (
        <li
          key={s.title}
          className={styles.step}
          data-reveal
          style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
        >
          <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
          <h3 className={styles.title}>{s.title}</h3>
          <p className={styles.text}>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
