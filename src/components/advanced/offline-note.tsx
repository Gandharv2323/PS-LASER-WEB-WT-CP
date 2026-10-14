import type { DataSource } from "@/lib/api/types";

/** Visible note whenever data came from the typed offline fallback instead of the live API. */
export function SourceBadge({ source, what = "data" }: { source: DataSource | undefined; what?: string }) {
  if (source === "spring") {
    return (
      <span className="ps-adv-badge ps-adv-badge--live">
        <i className="bx bx-wifi" aria-hidden="true" /> Live {what} (Spring API)
      </span>
    );
  }
  return (
    <span
      className="ps-adv-badge ps-adv-badge--offline"
      title="The Spring Boot API (:8081) is not reachable, so the built-in sample data is used."
    >
      <i className="bx bx-wifi-off" aria-hidden="true" /> Offline {what} (sample)
    </span>
  );
}

export function IndicativeNote() {
  return (
    <p className="ps-adv-note">
      <i className="bx bx-info-circle" aria-hidden="true" /> <strong>Indicative estimate — final quote on WhatsApp.</strong>{" "}
      Prices use a SAMPLE rate card for demonstration and are not PS Laser&apos;s real prices.
    </p>
  );
}
