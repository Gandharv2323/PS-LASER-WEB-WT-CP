import "@/components/advanced/advanced.css";

import type { Metadata } from "next";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { MachineFinder, QuoteCalculator, QuoteCart } from "@/features/quote";
import { getMaterials } from "@/lib/api/spring";

export const metadata: Metadata = {
  title: "Instant Estimate",
  description: "Indicative laser cutting, bending and powder coating estimate for sheet-metal parts. Final quote on WhatsApp.",
};

/**
 * SSG + ISR: no request-time APIs here, so the page is prerendered at build time.
 * Materials are fetched with `next.revalidate` (see getMaterials) and the page is
 * regenerated in the background at most once an hour. The calculator is a client island.
 */
export const revalidate = 3600;

export default async function QuotePage() {
  const { data: materials, source } = await getMaterials();
  return (
    <>
      <PageBanner
        title="Instant Estimate"
        subtitle="Get an indicative price for laser-cut and bent parts in seconds. Final quote on WhatsApp."
        image="/sites/pslaser/gallery/laser-cutting-bg.jpg"
        breadcrumb={[{ label: "Instant Estimate" }]}
      />
      <section className="services ps-adv-section">
        <div className="container">
          <div className="section-title">
            <h3>
              Instant <span>Estimate</span>
            </h3>
            <p className="ps-section-lead">Built from the same formula as our back office. Rates are SAMPLE values for demonstration only.</p>
          </div>
          <QuoteCalculator materials={materials} materialsSource={source} />
        </div>
      </section>
      <section id="cart" className="services section-bg ps-adv-section">
        <div className="container">
          <div className="section-title">
            <h3>
              Saved <span>Estimates</span>
            </h3>
          </div>
          <QuoteCart />
        </div>
      </section>
      <section className="services ps-adv-section">
        <div className="container">
          <div className="section-title">
            <h3>
              Which machine <span>will make it?</span>
            </h3>
          </div>
          <MachineFinder />
        </div>
      </section>
    </>
  );
}
