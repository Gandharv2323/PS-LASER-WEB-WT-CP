import "@/components/advanced/advanced.css";

import { TrackSkeleton } from "@/features/track";

/** Route-level streaming fallback shown instantly while the server renders /track. */
export default function Loading() {
  return (
    <section className="services ps-adv-section ps-adv-loading-page">
      <div className="container">
        <TrackSkeleton />
      </div>
    </section>
  );
}
