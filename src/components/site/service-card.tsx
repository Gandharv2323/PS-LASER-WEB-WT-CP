import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { services } from "@/lib/pslaser/data";
import { serviceHref } from "@/lib/site/nav";
import { WhatsAppButton } from "./button";
import styles from "./cards.module.css";

export type Service = (typeof services)[number];

type ServiceCardProps = {
  service: Service;
  index?: number;
  /** Override the "Learn more" link (defaults to serviceHref(slug)). Pass null to hide it. */
  href?: string | null;
  /** Show the WhatsApp quote button (default true). */
  quote?: boolean;
  headingAs?: "h2" | "h3" | "h4";
  revealDelay?: number;
  className?: string;
};

/** Image-led service card: title, summary, "Learn more" + WhatsApp quote. */
export function ServiceCard({
  service,
  index,
  href,
  quote = true,
  headingAs: H = "h3",
  revealDelay = 0,
  className,
}: ServiceCardProps) {
  const link = href === undefined ? serviceHref(service.slug) : href;
  return (
    <article
      className={[styles.card, styles.service, className].filter(Boolean).join(" ")}
      data-reveal
      style={revealDelay ? ({ "--reveal-delay": `${revealDelay}ms` } as CSSProperties) : undefined}
    >
      <div className={`s-media ${styles.media}`} style={{ "--ratio": "16 / 10" } as CSSProperties}>
        <Image
          src={service.image}
          alt=""
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 700px) 50vw, 100vw"
        />
        {typeof index === "number" && (
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className={styles.body}>
        <H className={`s-h3 ${styles.title}`}>
          {link ? (
            <Link href={link} className={styles.titleLink}>
              {service.title}
            </Link>
          ) : (
            service.title
          )}
        </H>
        <p className={styles.text}>{service.text}</p>
        <div className={styles.foot}>
          {link && (
            <Link href={link} className="s-btn s-btn--link" aria-label={`Learn more about ${service.title}`}>
              <span>Learn more</span>
              <ArrowRight className="s-btn__arrow" aria-hidden="true" />
            </Link>
          )}
          {quote && (
            <WhatsAppButton
              message={service.quoteMessage}
              variant="secondary"
              size="sm"
              aria-label={`Get a quote for ${service.title} on WhatsApp`}
            >
              Quote
            </WhatsAppButton>
          )}
        </div>
      </div>
    </article>
  );
}
