import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { cutMaterials, engineeringServices } from "@/components/sites/pslaser-pages/content";
import { CtaBand, ProcessStrip, SectionTitle, WaButton } from "@/components/sites/pslaser-pages/ui";
import { company, services } from "@/lib/pslaser/data";
import "@/components/sites/pslaser-pages/pages.css";

export const metadata: Metadata = {
  title: "Engineering Services",
  description:
    "CNC fiber laser cutting (MS 16 mm, SS 12 mm, Al 8 mm), 175 T CNC bending, Amada turret punching, laser welding, fabrication, 9-tank powder coating and CAD/CAM support at PS Laser, Velu, Pune.",
};

const architectural = services.find((s) => s.slug === "architectural");

export default function EngineeringServicesPage() {
  return (
    <>
      <PageBanner
        title="Engineering Services"
        subtitle="Laser cutting, bending, punching, welding, fabrication and powder coating, all in one shop at Velu, Pune."
        image="/sites/pslaser/gallery/laser-cutting-bg.jpg"
        breadcrumb={[{ label: "Engineering Services" }]}
      />

      <div className="psp">
        {/* Intro */}
        <section className="psp-section" aria-labelledby="eng-intro-title">
          <div className="container">
            <div className="psp-intro">
              <div data-aos="fade-up">
                <span className="psp-eyebrow">Sheet metal job shop</span>
                <h2 id="eng-intro-title">One shop, from flat sheet to finished part</h2>
                <hr />
                <p className="psp-lead">
                  PS Laser makes precision sheet metal components for industrial and OEM customers. Parts are cut
                  on our fiber lasers or Amada turret punches, formed on a CNC press brake, welded and assembled, then
                  powder coated on our own line. One team plans and checks the job from your drawing to dispatch.
                </p>
                <ul className="psp-jump" aria-label="Jump to a service">
                  {engineeringServices.map((s) => (
                    <li key={s.slug}>
                      <a href={`#${s.slug}`}>{s.title}</a>
                    </li>
                  ))}
                  <li>
                    <a href="#materials">Materials</a>
                  </li>
                </ul>
              </div>
              <figure data-aos="zoom-out" data-aos-delay="100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={company.factoryPhoto} alt="PS Laser unit and signboard at Velu, Bhor, Pune" />
                <figcaption>Our unit at Gat No. 753, Velu, Tal. Bhor, Pune</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* One section per service; ids are linked from the header and footer. */}
        {engineeringServices.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            className={`psp-section${i % 2 === 0 ? " psp-alt" : ""}`}
            aria-labelledby={`${s.slug}-title`}
          >
            <div className="container">
              <div className={`psp-service${i % 2 === 1 ? " is-flipped" : ""}`}>
                <figure className="psp-service-media" data-aos="fade-up">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.imageAlt} loading="lazy" decoding="async" />
                  <span className="psp-service-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <figcaption className="psp-figure-note">{s.imageNote}</figcaption>
                </figure>

                <div className="psp-service-body" data-aos="fade-up" data-aos-delay="100">
                  <span className="psp-eyebrow">{s.eyebrow}</span>
                  <h2 id={`${s.slug}-title`}>{s.title}</h2>
                  {s.intro.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}

                  {s.machines.length > 0 ? (
                    <>
                      <h3 className="psp-subhead">{s.machines.length > 1 ? "Machines" : "Machine"}</h3>
                      <ul className={`psp-machines${s.machines.length > 1 ? " has-2" : ""}`}>
                        {s.machines.map((m) => (
                          <li key={m.slug} className="psp-machine">
                            <div className="psp-machine-img">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={m.image} alt={m.name} loading="lazy" decoding="async" />
                            </div>
                            <div className="psp-machine-body">
                              <h4>{m.name}</h4>
                              <small>
                                {m.slug === "plc-powder-coating-plant"
                                  ? "Representative image"
                                  : "Manufacturer image of the model we run"}
                              </small>
                              <ul className="psp-specs">
                                {m.specs.map((sp) => (
                                  <li key={sp}>{sp}</li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {s.facilities ? (
                    <>
                      <h3 className="psp-subhead">{s.facilities.title}</h3>
                      <div className="psp-facility">
                        <ul className="psp-ticks">
                          {s.facilities.points.map((p) => (
                            <li key={p}>
                              <i className="bx bx-check" aria-hidden="true" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : null}

                  {s.capacity ? (
                    <>
                      <h3 className="psp-subhead">Capacity</h3>
                      <dl className="psp-capacity">
                        {s.capacity.map((c) => (
                          <div key={c.label}>
                            <dt>{c.label}</dt>
                            <dd>{c.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  ) : null}

                  <h3 className="psp-subhead">Typical applications</h3>
                  <ul className="psp-ticks">
                    {s.applications.map((a) => (
                      <li key={a}>
                        <i className="bx bx-check-circle" aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>

                  <div className="psp-actions">
                    <WaButton message={s.quoteMessage}>{s.quoteLabel}</WaButton>
                    {s.slug === "laser-cutting" ? (
                      <Link href="/blogs/preparing-dxf-files-for-laser-cutting" className="psp-btn psp-btn-outline">
                        <i className="bx bx-file" aria-hidden="true" />
                        <span>DXF checklist</span>
                      </Link>
                    ) : null}
                    {s.slug === "powder-coating" ? (
                      <Link href="/blogs/why-pre-treatment-matters-in-powder-coating" className="psp-btn psp-btn-outline">
                        <i className="bx bx-info-circle" aria-hidden="true" />
                        <span>Why pre-treatment matters</span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Architectural hand-off (anchor used by the header dropdown) */}
        {architectural ? (
          <section id="architectural" className="psp-section" aria-labelledby="architectural-title">
            <div className="container">
              <div className="psp-custom" data-aos="fade-up">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={architectural.image} alt="Laser-cut metal jaali panel" loading="lazy" decoding="async" />
                <div>
                  <span className="psp-eyebrow">Also from our shop</span>
                  <h2 id="architectural-title">{architectural.title}</h2>
                  <p>
                    The same lasers, press brake and powder coating line also make jaali screens, decorative panels,
                    cabinet grills and accessories, and architectural job work.
                  </p>
                  <div className="psp-actions">
                    <Link href="/architectural-services" className="psp-btn psp-btn-solid">
                      <span>Architectural services</span>
                      <i className="bx bx-right-arrow-alt" aria-hidden="true" />
                    </Link>
                    <Link href="/pattern-design" className="psp-btn psp-btn-outline">
                      <span>Pattern designs</span>
                    </Link>
                  </div>
                  <p className="psp-figure-note">Image: representative work</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Materials */}
        <section id="materials" className="psp-section psp-alt" aria-labelledby="materials-title">
          <div className="container">
            <SectionTitle
              id="materials-title"
              strong="Materials"
              light="We Cut"
              lead="Maximum laser cutting thickness for each material on our fiber lasers (3 m x 1.5 m bed)."
            />
            <ul className="psp-materials">
              {cutMaterials.map((m, i) => (
                <li key={m.slug} className="psp-material" data-aos="fade-up" data-aos-delay={String(i * 70)}>
                  <div className={`psp-swatch psp-swatch-${m.slug}`} aria-hidden="true">
                    <strong>{m.max}</strong>
                  </div>
                  <div className="psp-material-body">
                    <h3>
                      {m.name} <span className="psp-sr-only">up to {m.max}</span>
                    </h3>
                    <p>{m.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="psp-footnote">
              Bending: 1–12 mm on the 175 T x 3 m press brake. Turret punching: up to 5 mm (32 T) and 3 mm (16 T).
              Not sure what to specify? Read our guide to{" "}
              <Link className="psp-textlink" href="/blogs/choosing-sheet-material-and-thickness">
                choosing material and thickness
              </Link>
              .
            </p>
          </div>
        </section>

        <ProcessStrip />

        <CtaBand
          title="Have a drawing ready?"
          text="Send your DXF or drawing on WhatsApp with the material, thickness and quantity, and we will come back with a quote."
        />
      </div>
    </>
  );
}
