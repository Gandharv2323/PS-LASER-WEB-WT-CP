import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { GENERAL_QUOTE_MESSAGE, company, machines, whatsapp, whyUs } from "@/lib/pslaser/data";
import { routes } from "@/lib/site/nav";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About PS Laser, a precision engineering and sheet metal manufacturer at Velu, Bhor, Pune: our mission, vision, values and the machines behind our work.",
};

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

/** PS Laser values (company profile, brief §3). */
const VALUES = [
  { icon: "bx-happy-heart-eyes", title: "Customer Satisfaction", text: "Putting customer needs first and aiming to exceed expectations on every order." },
  { icon: "bx-shield-quarter", title: "Integrity", text: "Professional, reliable dealings and long-term relationships with our customers." },
  { icon: "bx-bulb", title: "Innovation", text: "Encouraging creative solutions and new technology, offered cost-effectively." },
  { icon: "bx-badge-check", title: "Quality", text: "High-quality work on current equipment, checked with calibrated instruments." },
  { icon: "bx-timer", title: "Efficiency", text: "Controlled, repeatable processes that scale from prototypes to batches." },
];

/** Core principles (company profile "core values" box). */
const PRINCIPLES = [
  { icon: "bx-user-voice", title: "Individual ability & creativity", text: "We encourage every team member to bring ideas to the job." },
  { icon: "bx-trending-up", title: "Hard work & self-improvement", text: "Continuous improvement, innovation and productivity on the shop floor." },
  { icon: "bx-medal", title: "Opportunity on merit", text: "Growth is earned through skill and effort." },
  { icon: "bx-group", title: "Well-being for all", text: "Caring for employees, stakeholders, the community and the country." },
];

const MACHINE_SUMMARY = machines.map((m) => ({ name: m.shortName, category: m.category, slug: m.slug }));

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About PS Laser"
        subtitle="A precision engineering and sheet metal manufacturer at Velu, Bhor, Pune."
        image="/sites/pslaser/gallery/laser-cutting-bg.jpg"
        breadcrumb={[{ label: "About Us" }]}
      />

      {/* Who we are: image + text rows (Kakade about layout) */}
      <section id="about" className="about section-bg">
        <div className="container" data-aos="fade-up">
          <div id="about-scale" className="row">
            <div id="scale-left" className="col-lg-6" data-aos="zoom-out" data-aos-delay="100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.factoryPhoto}
                className="img-fluid ps-about-img"
                alt="PS Laser factory front and signboard at Velu, Pune"
              />
            </div>
            <div
              id="scale-right"
              className="col-lg-6 pt-4 pt-lg-0 content d-flex flex-column justify-content-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3>Who We Are</h3>
              <hr />
              <p className="font-regular">
                PS Laser manufactures precision engineering and sheet metal components for industrial
                and OEM customers. We work from your drawing: cutting, punching, forming, welding and
                finishing parts with processes that are controlled, repeatable and ready to scale.
              </p>
              <p className="font-regular">
                Our facility is at Gat No. 753, Velu (Khed Shivapur area), Tal. Bhor, Dist. Pune,
                where every process runs under one roof.
              </p>
              <Link href={routes.engineering} className="btn">
                OUR SERVICES
              </Link>
            </div>
          </div>
          <div id="about-vision" className="row">
            <div
              id="vision-left"
              className="col-lg-6 pt-4 pt-lg-0 content d-flex flex-column justify-content-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3>Everything Under One Roof</h3>
              <hr />
              <p className="font-regular">
                Fiber laser cutting, Amada CNC turret punching, CNC press brake bending, laser and
                manual welding, grinding and buffing, and a PLC-based powder coating plant all run in
                the same workshop. Fewer hand-offs mean better control over quality and lead time.
              </p>
              <p className="font-regular">
                Our design desk supports 3D modelling, drafting, blank development, nesting and laser
                programming, so a sketch can become a production-ready part.
              </p>
              <Link href="/#machines" className="btn">
                SEE OUR MACHINES
              </Link>
            </div>
            <div id="vision-right" className="col-lg-6" data-aos="zoom-out" data-aos-delay="100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sites/pslaser/gallery/fabrication-welding-bg.jpg"
                className="img-fluid ps-about-img"
                alt="Sheet metal fabrication and welding"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & vision cards */}
      <section id="mission-vision" className="services ps-mv">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Mission &amp; <span>Vision</span>
            </h3>
          </div>
          <div className="row">
            <div className="col-md-6 mt-4 d-flex align-items-stretch" data-aos="fade-up">
              <div className="ps-mv-card">
                <i className="bx bx-target-lock" aria-hidden="true" />
                <h4>Our Mission</h4>
                <p>{company.mission}</p>
              </div>
            </div>
            <div className="col-md-6 mt-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="100">
              <div className="ps-mv-card ps-mv-card--dark">
                <i className="bx bx-show" aria-hidden="true" />
                <h4>Our Vision</h4>
                <p>{company.vision}</p>
              </div>
            </div>
          </div>
          <p className="ps-purpose" data-aos="fade-up">
            <strong>Our purpose:</strong> offering new technology services and solutions in a
            cost-effective manner.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section id="values" className="services section-bg">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Our <span>Values</span>
            </h3>
          </div>
          <div className="row justify-content-center">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="col-lg-4 col-md-6 mt-4 d-flex align-items-stretch"
                data-aos="zoom-in"
                data-aos-delay={(i % 3) * 80}
              >
                <div className="box-img ps-value">
                  <i className={`bx ${v.icon} ps-icon`} aria-hidden="true" />
                  <h5>{v.title}</h5>
                  <p>{v.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title ps-subtitle">
            <h3>
              How We <span>Work Together</span>
            </h3>
          </div>
          <div className="row">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="col-lg-3 col-md-6 mt-4 d-flex align-items-stretch"
                data-aos="zoom-in"
                data-aos-delay={i * 80}
              >
                <div className="box-img ps-value">
                  <i className={`bx ${p.icon} ps-icon`} aria-hidden="true" />
                  <h5>{p.title}</h5>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="whyus" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Why Choose <span>PS Laser</span>
            </h3>
          </div>
          <div className="row">
            {[
              ...whyUs,
              "Dedicated welding stations for MS, SS & Aluminium",
              "PLC-based powder coating with 9-tank pre-treatment",
              "In-house quality inspection with calibrated instruments",
            ].map((t, i) => (
              <div key={t} className="col-lg-4 col-md-6 mt-3" data-aos="fade-up" data-aos-delay={(i % 3) * 60}>
                <div className="ps-check">
                  <i className="bx bx-check-circle" aria-hidden="true" />
                  <span>{t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory photo band */}
      <section id="factory" className="ps-factory">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7" data-aos="zoom-out">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.factoryPhoto}
                alt="PS Laser workshop at Velu, Bhor, Pune"
                className="img-fluid ps-factory-img"
                loading="lazy"
              />
            </div>
            <div className="col-lg-5 mt-4 mt-lg-0" data-aos="fade-up" data-aos-delay="100">
              <h3>Our Facility at Velu</h3>
              <p>{company.address}</p>
              <Link href={routes.contact} className="btn btn-primary">
                <i className="bx bx-map" aria-hidden="true" /> Location &amp; Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Machines summary */}
      <section id="machines-summary" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Machines on <span>Our Floor</span>
            </h3>
          </div>
          <div className="row">
            {MACHINE_SUMMARY.map((m, i) => (
              <div key={m.slug} className="col-lg-3 col-md-4 col-6 mt-3" data-aos="fade-up" data-aos-delay={(i % 4) * 60}>
                <Link href={`/#${m.slug}`} className="ps-machine-chip">
                  <span>{m.category}</span>
                  <strong>{m.name}</strong>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="production-ramp" className="production-ramp">
        <div className="container" data-aos="fade-up">
          <div className="section-title text-center">
            <h2>HAVE A DRAWING READY?</h2>
            <p className="ps-cta-sub">Send it on WhatsApp with material, thickness and quantity for a quotation.</p>
            <a href={whatsapp(GENERAL_QUOTE_MESSAGE)} {...EXT} className="btn btn-primary">
              <i className="bx bxl-whatsapp" aria-hidden="true" /> Get a Quote on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
