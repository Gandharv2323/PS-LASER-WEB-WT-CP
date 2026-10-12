import Image from "next/image";
import styles from "./logo.module.css";

type LogoProps = {
  /** "dark" = for light backgrounds, "light" = for dark backgrounds. */
  tone?: "dark" | "light";
  /** Render both variants and let a parent switch them via [data-logo-tone]. */
  adaptive?: boolean;
  priority?: boolean;
  className?: string;
};

/**
 * PS Laser shield mark (cropped from the official logo) + "PS LASER" set as text,
 * so the wordmark stays crisp on any background.
 */
export function Logo({ tone = "dark", adaptive = false, priority = false, className }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(" ")} data-tone={tone}>
      <span className={styles.mark}>
        {(adaptive || tone === "dark") && (
          <Image
            src="/sites/pslaser/logo/ps-laser-mark.png"
            alt=""
            width={544}
            height={559}
            sizes="48px"
            priority={priority}
            className={adaptive ? styles.markDark : undefined}
          />
        )}
        {(adaptive || tone === "light") && (
          <Image
            src="/sites/pslaser/logo/ps-laser-mark-light.png"
            alt=""
            width={544}
            height={559}
            sizes="48px"
            priority={priority}
            className={adaptive ? styles.markLight : undefined}
          />
        )}
      </span>
      <span className={styles.word}>
        <span className={styles.ps}>PS</span> Laser
      </span>
    </span>
  );
}
