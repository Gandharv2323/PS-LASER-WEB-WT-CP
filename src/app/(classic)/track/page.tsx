import "@/components/advanced/advanced.css";

import type { Metadata } from "next";
import { Suspense } from "react";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { TrackForm, TrackResult, TrackSkeleton } from "@/features/track";
import { QuoteCart } from "@/features/quote";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the production status of your PS Laser job with your order number and phone number.",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

/**
 * SSR: reading `searchParams` makes this route dynamic (rendered per request). The order
 * itself is fetched in <TrackResult> (no-store) and streamed in through <Suspense>; the
 * `key` makes React show the fallback again for every new search.
 */
export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const orderNo = first(sp.orderNo);
  const phone = first(sp.phone);

  return (
    <>
      <PageBanner
        title="Track Your Order"
        subtitle="Enter your order number and phone to see where your parts are in production."
        image="/sites/pslaser/gallery/cnc-bending-bg.jpg"
        breadcrumb={[{ label: "Track Order" }]}
      />
      <section className="services ps-adv-section">
        <div className="container">
          <TrackForm orderNo={orderNo} phone={phone} />
          <div className="mt-4">
            {orderNo && phone ? (
              <Suspense key={`${orderNo}|${phone}`} fallback={<TrackSkeleton />}>
                <TrackResult orderNo={orderNo} phone={phone} />
              </Suspense>
            ) : (
              <p className="ps-adv-muted">Your order number is on the WhatsApp confirmation we send when your drawing is approved.</p>
            )}
          </div>
          <div className="mt-4">
            <QuoteCart compact />
          </div>
        </div>
      </section>
    </>
  );
}
