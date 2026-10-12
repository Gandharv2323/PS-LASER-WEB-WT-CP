import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { architecturalRows, cutMaterials } from "@/components/sites/pslaser-pages/content";
import { CtaBand, SectionTitle, WaButton } from "@/components/sites/pslaser-pages/ui";
import "@/components/sites/pslaser-pages/pages.css";

export const metadata: Metadata = {
  title: "Architectural Services",
  description:
    "Laser-cut jaali and screens, decorative panels, cabinet grills and accessories, and architectural job work, cut, bent and powder coated by PS Laser at Velu, Pune.",
};

const ARCH_MESSAGE =
  "Hi PS Laser, I have an architectural / interior metalwork requirement (jaali, panels, grills). Details: ___, Size: ___, Material: ___, Quantity: ___.";

export default function ArchitecturalServicesPage() {
  return (
    <>
      <PageBanner
        title="Architectural Services"
        subtitle="Laser-cut jaali, decorative panels, cabinet grills and custom metalwork, cut, formed and finished in one shop."
        image="/sites/pslaser/products/laser-cut-jali-pattern.jpg"
        breadcrumb={[{ label: "Architectural Services" }]}
      />

      <div className="psp">
        <section className="psp-section" aria-labelledby="arch-intro-title">
          <div className="container">
            <SectionTitle
              id="arch-intro-title"
              strong="Metalwork"
              light="for Spaces"
              lead="Industrial machines, applied to architecture. The fiber lasers, CNC press brake and powder coating line that make our industrial parts also turn designers' drawings into screens, panels and grills."
            />
            <ul className="psp-jump is-center" aria-label="Jump to a section">
              {architecturalRows.map((r) => (
                <li key={r.id}>
                  <a href={`#${r.id}`}>{r.title}</a>
                </li>
              ))}
              <li>
                <a href="#arch-materials">Materials</a>
              </li>
            </ul>
          </div>
        </section>

        <div>
          {architecturalRows.map((r, i) => (
            <section
              key={r.id}
              id={r.id}
              className={`psp-scale${i % 2 === 1 ? " is-flipped" : ""}`}
              aria-labelledby={`${r.id}-title`}
            >
              <figure className="psp-scale-media" data-aos={i % 2 === 1 ? "fade-left" : "fade-right"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.imageAlt} loading="lazy" decoding="async" />
                <figcaption>Representative image</figcaption>
              </figure>
              <div className="psp-scale-text" data-aos="fade-up" data-aos-delay="100">
                <span className="psp-eyebrow">{String(i + 1).padStart(2, "0")}</span>
                <h2 id={`${r.id}-title`}>{r.title}</h2>
                <hr />
                {r.text.map((t) => (
                  <p key={t.slice(0, 24)}>{t}</p>
                ))}
                <ul className="psp-ticks">
                  {r.points.map((p) => (
                    <li key={p}>
                      <i className="bx bx-check" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                <WaButton message={r.quoteMessage}>{r.cta}</WaButton>
                {r.id === "jaali-screens" ? (
                  <p className="psp-figure-note">
                    Browse ideas in our{" "}
                    <Link href="/pattern-design" className="psp-textlink">
                      pattern catalogue
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <section id="arch-materials" className="psp-section psp-alt" aria-labelledby="arch-materials-title">
          <div className="container">
            <SectionTitle
              id="arch-materials-title"
              strong="Materials"
              light="& Finishes"
              lead="Mild steel with a powder-coated finish is the most economical choice. Stainless steel and aluminium resist corrosion without coating, and brass and copper make warm decorative accents."
            />
            <ul className="psp-materials">
              {cutMaterials.map((m, i) => (
                <li key={m.slug} className="psp-material" data-aos="fade-up" data-aos-delay={String(i * 70)}>
                  <div className={`psp-swatch psp-swatch-${m.slug}`} aria-hidden="true">
                    <strong>{m.max}</strong>
                  </div>
                  <div className="psp-material-body">
                    <h3>
                      {m.name} <span className="psp-sr-only">laser cut up to {m.max}</span>
                    </h3>
                    <p>{m.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="psp-footnote">
              Thicknesses shown are our laser cutting maximums. Most screens and panels use much thinner sheet, and we
              can suggest a thickness that suits the panel size and fixing. See the{" "}
              <Link href="/engineering-services#powder-coating" className="psp-textlink">
                powder coating process
              </Link>{" "}
              for finish details.
            </p>
          </div>
        </section>

        <section className="psp-section" aria-labelledby="arch-how-title">
          <div className="container">
            <div className="psp-custom" data-aos="fade-up">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sites/pslaser/products/powder-coated-decorative-panel.jpg"
                alt="Powder-coated decorative metal panel"
                loading="lazy"
                decoding="async"
              />
              <div>
                <span className="psp-eyebrow">For architects, designers & contractors</span>
                <h2 id="arch-how-title">How a project runs</h2>
                <ol className="psp-steps">
                  <li>Share your drawing, DXF, reference image or one of our pattern codes on WhatsApp.</li>
                  <li>We confirm material, thickness, panel sizes, fixing details and finish, then send a quote.</li>
                  <li>We program, cut and form the panels, then weld any frames.</li>
                  <li>Parts are pre-treated, powder coated and inspected before dispatch.</li>
                </ol>
                <div className="psp-actions">
                  <WaButton message={ARCH_MESSAGE}>Start a project</WaButton>
                  <Link href="/gallery" className="psp-btn psp-btn-outline">
                    <span>View gallery</span>
                  </Link>
                </div>
                <p className="psp-figure-note">Image: representative work</p>
              </div>
            </div>
          </div>
        </section>

        <CtaBand
          title="Have a design in mind?"
          text="Send us a sketch, a DXF or a reference photo. We will suggest a material and finish, and quote for the panels."
          message={ARCH_MESSAGE}
          button="Enquire on WhatsApp"
        />
      </div>
    </>
  );
}
