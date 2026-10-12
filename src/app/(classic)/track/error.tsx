"use client";

import { useEffect } from "react";
import { whatsapp } from "@/lib/pslaser/data";

/** Route error boundary (must be a Client Component). `retry` re-fetches the segment. */
export default function TrackError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.warn("Tracking failed:", error.digest ?? error.message);
  }, [error]);
  return (
    <section className="services">
      <div className="container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Tracking is unavailable right now</h4>
          <p>Something went wrong while loading your order. Please try again or ask us on WhatsApp.</p>
          <button type="button" className="btn btn-primary mr-2" onClick={() => retry()}>
            Try again
          </button>
          <a href={whatsapp("Hi PS Laser, I want to check my order status.")} target="_blank" rel="noopener noreferrer" className="btn ps-wa-btn">
            <i className="bx bxl-whatsapp" aria-hidden="true" /> WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
