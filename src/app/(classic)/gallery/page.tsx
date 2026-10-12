import type { Metadata } from "next";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { GalleryGrid } from "@/components/sites/pslaser-pages/gallery-grid";
import { CtaBand, SectionTitle } from "@/components/sites/pslaser-pages/ui";
import "@/components/sites/pslaser-pages/pages.css";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Images of PS Laser's sheet metal work, machines, facility and quality instruments: fiber laser cutting, CNC bending, Amada turret punching, laser welding and powder coating in Pune.",
};

export default function GalleryPage() {
  return (
    <>
      <PageBanner
        title="Gallery"
        subtitle="Our machines, our unit at Velu, and the kind of sheet metal work we produce."
        image="/sites/pslaser/products/industrial-enclosures-laser-cut-parts.jpg"
        breadcrumb={[{ label: "Gallery" }]}
      />

      <div className="psp">
        <section className="psp-section" aria-labelledby="gallery-title">
          <div className="container">
            <SectionTitle id="gallery-title" strong="Our" light="Gallery" />
            <p className="psp-notice" data-aos="fade-up">
              <i className="bx bx-info-circle" aria-hidden="true" />
              <span>
                Every caption says what the image is. Product and process images are representative renders of the
                kind of work we do, not photos of specific client jobs. Machine images are manufacturer pictures of
                the models we run. The factory front is a photo of our own unit.
              </span>
            </p>
            <GalleryGrid />
          </div>
        </section>

        <CtaBand
          title="Need parts like these?"
          text="Share your drawing on WhatsApp and we will quote for cutting, bending, welding and powder coating."
        />
      </div>
    </>
  );
}
