import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { PatternCatalogue } from "@/components/sites/pslaser-pages/pattern-catalogue";
import { CtaBand, SectionTitle, WaButton } from "@/components/sites/pslaser-pages/ui";
import "@/components/sites/pslaser-pages/pages.css";

export const metadata: Metadata = {
  title: "Pattern Design",
  description:
    "Laser-cut jaali and screen pattern concepts (geometric, floral-inspired and linear) from PS Laser, Pune. Pick a pattern code or send your own DXF design.",
};

const CUSTOM_MESSAGE =
  "Hi PS Laser, I have my own jaali / screen design to laser cut. Panel size: ___ x ___ mm, Material & thickness: ___, Quantity: ___, Finish/colour: ___. Sending the DXF / image here.";

export default function PatternDesignPage() {
  return (
    <>
      <PageBanner
        title="Pattern Design"
        subtitle="Jaali and screen pattern ideas for laser cutting. Choose one, adapt it, or send your own."
        image="/sites/pslaser/products/laser-cut-jali-pattern.jpg"
        breadcrumb={[{ label: "Pattern Design" }]}
      />

      <div className="psp">
        <section className="psp-section psp-alt" aria-labelledby="patterns-title">
          <div className="container">
            <SectionTitle
              id="patterns-title"
              strong="Pattern"
              light="Catalogue"
              lead="Design concepts for partitions, screens, gate and railing inserts, and cabinet grills. Click a pattern to enlarge it, then enquire on WhatsApp with its code."
            />
            <p className="psp-notice" data-aos="fade-up">
              <i className="bx bx-info-circle" aria-hidden="true" />
              <span>
                <strong>Design concepts. We can cut your own design too.</strong> These drawings show the style of
                each pattern. Scale, bridge widths and the border are finalised for your panel size, material and
                thickness before cutting.
              </span>
            </p>
            <PatternCatalogue />
          </div>
        </section>

        <section id="custom-design" className="psp-section" aria-labelledby="custom-title">
          <div className="container">
            <div className="psp-custom" data-aos="fade-up">
              <figure className="psp-flat-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sites/pslaser/products/laser-cut-jali-pattern.jpg"
                  alt="Laser-cut metal jaali panel"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="psp-figure-note">Representative work</figcaption>
              </figure>
              <div>
                <span className="psp-eyebrow">Custom DXF accepted</span>
                <h2 id="custom-title">Cut your own pattern</h2>
                <p>
                  Already have a design? Send a DXF and we will nest it and cut it on our fiber lasers (3 m x 1.5 m
                  bed). If you only have an image or a sketch, our design team can redraw it as cutting geometry.
                </p>
                <ol className="psp-steps">
                  <li>Send a DXF, an image or a pattern code with the panel size and quantity.</li>
                  <li>We check bridge widths and hole sizes for your material and thickness.</li>
                  <li>We cut the panels, then fold and powder coat them if needed.</li>
                </ol>
                <div className="psp-actions">
                  <WaButton message={CUSTOM_MESSAGE}>Send your design</WaButton>
                  <Link href="/blogs/preparing-dxf-files-for-laser-cutting" className="psp-btn psp-btn-outline">
                    <i className="bx bx-file" aria-hidden="true" />
                    <span>DXF checklist</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CtaBand
          title="Found a pattern you like?"
          text="Message us the pattern code, panel size, material and finish, and we will send a quote."
          message="Hi PS Laser, I'd like a quote for a laser-cut jaali pattern. Pattern code: ___, Panel size: ___ x ___ mm, Material: ___, Quantity: ___."
          button="Enquire on WhatsApp"
        />
      </div>
    </>
  );
}
