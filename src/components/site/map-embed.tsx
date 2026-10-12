import { ArrowUpRight, Navigation } from "lucide-react";
import { company, mapDirections, mapEmbed, mapShare } from "@/lib/pslaser/data";
import styles from "./map-embed.module.css";

type MapEmbedProps = {
  /** Aspect ratio of the map frame, e.g. "4 / 3" (default) or "16 / 9". */
  ratio?: string;
  /** Show the address + "Get directions" / "Open in Google Maps" bar (default true). */
  showActions?: boolean;
  className?: string;
};

/** Lazy Google Maps iframe for the "PS Laser" place, with directions links. */
export function MapEmbed({ ratio = "4 / 3", showActions = true, className }: MapEmbedProps) {
  return (
    <figure className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <div className={styles.frame} style={{ aspectRatio: ratio }}>
        <iframe
          src={mapEmbed}
          title="Map: PS Laser, Gat No. 753, Velu, Bhor, Pune"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {showActions && (
        <figcaption className={styles.bar}>
          <span className={styles.addr}>{company.address}</span>
          <span className={styles.links}>
            <a href={mapDirections} target="_blank" rel="noopener noreferrer" className="s-btn s-btn--sm">
              <Navigation aria-hidden="true" />
              <span>Get directions</span>
            </a>
            <a
              href={mapShare}
              target="_blank"
              rel="noopener noreferrer"
              className="s-btn s-btn--sm s-btn--secondary"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight className="s-btn__arrow" aria-hidden="true" />
            </a>
          </span>
        </figcaption>
      )}
    </figure>
  );
}
