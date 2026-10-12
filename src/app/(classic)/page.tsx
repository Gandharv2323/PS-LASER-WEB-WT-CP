import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sites/kakadelaser/hero";
import { ProcessCarousel } from "@/components/sites/kakadelaser/process-carousel";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  industries,
  machines,
  materials,
  products,
  quality,
  services,
  stats,
  whatsapp,
  whyUs,
} from "@/lib/pslaser/data";
import { routes, serviceHref } from "@/lib/site/nav";

export const metadata: Metadata = {
  title: { absolute: "PS Laser | Precision Sheet Metal & CNC Laser Cutting in Pune" },
  description:
    "PS Laser, Velu (Bhor), Pune: custom precision engineering and sheet metal work built to your drawing. Fiber laser cutting, CNC bending, Amada turret punching, laser welding, fabrication and powder coating.",
};

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;
const QUOTE = whatsapp(GENERAL_QUOTE_MESSAGE);

/** Equipment brands on PS Laser's floor (machines, not partners). Logo files: public/sites/pslaser/brands/SOURCES.txt */
const BRANDS: { name: string; logo?: string; w: number; h: number }[] = [
  { name: "HSG Laser", logo: "/sites/pslaser/brands/hsg-laser.webp", w: 124, h: 34 },
  { name: "Amada", logo: "/sites/pslaser/brands/amada.svg", w: 859, h: 222 },
  { name: "Genesis", w: 0, h: 0 },
  { name: "Wagner", logo: "/sites/pslaser/brands/wagner.png", w: 300, h: 122 },
];

const INDUSTRY_ICONS = ["bx-buildings", "bxs-zap", "bx-cog", "bx-building-house", "bx-cabinet"];
const WHY_ICONS = ["bx-badge-check", "bx-desktop", "bx-user-check", "bx-wrench", "bx-target-lock", "bx-support"];

const STEPS = [
  { icon: "bxl-whatsapp", label: "Share your drawing (DXF / PDF)" },
  { icon: "bx-receipt", label: "Receive a clear quotation" },
  { icon: "bx-check-circle", label: "Approve, and we manufacture" },
  { icon: "bxs-truck", label: "Inspected, packed & delivered" },
];

const GALLERY_PREVIEW = [
  { title: "Laser Cutting", image: "/sites/pslaser/gallery/laser-cutting-bg.jpg" },
  { title: "CNC Bending", image: "/sites/pslaser/gallery/cnc-bending-bg.jpg" },
  { title: "Fabrication & Welding", image: "/sites/pslaser/gallery/fabrication-welding-bg.jpg" },
  { title: "Powder Coating", image: "/sites/pslaser/gallery/powder-coating-bg.jpg" },
];

const TEASERS = [
  {
    icon: "bx-book-open",
    title: "Blog & Guides",
    text: "Practical notes on materials, thicknesses, drawings and finishes for sheet metal parts.",
    href: routes.blogs,
    cta: "Read the blog",
  },
  {
    icon: "bx-shape-polygon",
    title: "Pattern Design",
    text: "Jaali, screens and decorative panels laser-cut from your pattern or ours.",
    href: routes.patternDesign,
    cta: "See patterns",
  },
  {
    icon: "bx-map-pin",
    title: "Visit or Call Us",
    text: "Gat No. 753, Velu, Tal. Bhor, Pune. Four direct numbers, email and WhatsApp.",
    href: routes.contact,
    cta: "Contact details",
  },
];

const productQuote = (title: string) =>
  `Hi PS Laser, I need a quote for ${title.toLowerCase()}. Material: ___, Size: ___, Quantity: ___. I can share the drawing.`;

export default function Home() {
  return (
    <>
      <Hero />

      {/* Equipment strip (PS Laser has no published client list, so these are machine brands) */}
      <section id="clients" className="clients section-bg">
        <div className="container">
          <div className="row align-items-center">
            <div className="column col-lg-4 col-12" data-aos="fade-in">
              <p className="ps-strip-lead">
                Equipped with <span>branded, precision machines</span>
              </p>
            </div>
            <div className="company column col-lg-8 col-12 row ps-brand-row" data-aos="fade-in">
              {BRANDS.map((b) => (
                <div
                  key={b.name}
                  className="sprites col-lg-3 col-6 d-flex align-items-center justify-content-center"
                >
                  {b.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="ps-brand-logo"
                      src={b.logo}
                      alt={`${b.name} logo`}
                      width={b.w}
                      height={b.h}
                      loading="lazy"
                    />
                  ) : (
                    <span className="ps-brand-name">{b.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about section-bg">
        <div className="container" data-aos="fade-up">
          <div id="about-scale" className="row">
            <div id="scale-left" className="col-lg-6" data-aos="zoom-out" data-aos-delay="100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.factoryPhoto}
                className="img-fluid ps-about-img"
                alt="PS Laser factory and signboard at Velu, Pune"
              />
            </div>
            <div
              id="scale-right"
              className="col-lg-6 pt-4 pt-lg-0 content d-flex flex-column justify-content-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3>One Workshop, Every Sheet Metal Step</h3>
              <hr />
              <p className="font-regular">
                PS Laser makes custom sheet metal parts and assemblies for industrial and OEM
                customers. Cutting, punching, bending, welding and powder coating all happen at our
                Velu facility, so your parts move from one process to the next without leaving our
                hands.
              </p>
              <Link href={routes.about} className="btn">
                ABOUT US
              </Link>
            </div>
          </div>
          <div id="about-vision" className="row">
            <div
              id="vision-left"
              className="col-lg-6 pt-4 pt-lg-0 content d-flex flex-column"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3>What Drives Us</h3>
              <hr />
              <p className="font-regular">
                <strong>Mission:</strong> {company.mission}
              </p>
              <p className="font-regular">
                <strong>Vision:</strong> {company.vision}
              </p>
              <Link href={routes.engineering} className="btn">
                OUR SERVICES
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

      {/* Specs bar */}
      <section id="specs-bar" className="section-bg">
        <div className="container">
          <div className="row">
            <div className="specs col-12 row" data-aos="fade-in">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="sprites col-6 col-md-4 col-lg-2 d-flex flex-column align-items-center justify-content-center ps-stat"
                >
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing capabilities */}
      <section id="services" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              What We
              <br />
              <span>Manufacture For You</span>
            </h3>
          </div>
          <div className="row">
            {services.map((s) => (
              <div
                key={s.slug}
                className="col-lg-3 col-md-4 col-sm-6 col-xs-12 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div id={`service-${s.slug}`} className="box-img ps-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} className="img-fluid ps-card-img" alt={s.title} loading="lazy" />
                  <h4>
                    <Link href={serviceHref(s.slug)}>{s.title}</Link>
                  </h4>
                  <p>{s.text}</p>
                  <div className="ps-card-actions">
                    <a href={whatsapp(s.quoteMessage)} {...EXT} className="btn cap-getquote">
                      Get Quote
                    </a>
                    <Link href={serviceHref(s.slug)} className="btn cap-explore">
                      EXPLORE MORE
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machines */}
      <section id="machines" className="services ps-machines">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Our
              <br />
              <span>Machines</span>
            </h3>
          </div>
          <div className="row">
            {machines.map((m) => (
              <div
                key={m.slug}
                className="col-lg-3 col-md-4 col-sm-6 col-xs-12 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div id={m.slug} className="box-img ps-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} className="img-fluid ps-card-img ps-machine-img" alt={m.name} loading="lazy" />
                  <span className="ps-category">{m.category}</span>
                  <h4>{m.name}</h4>
                  <ul className="ps-specs">
                    {m.specs.map((sp) => (
                      <li key={sp}>
                        <i className="bx bx-check" aria-hidden="true" /> {sp}
                      </li>
                    ))}
                  </ul>
                  <div className="ps-card-actions">
                    <a href={whatsapp(m.quoteMessage)} {...EXT} className="btn cap-getquote">
                      <i className="bx bxl-whatsapp" aria-hidden="true" /> Get Quote on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ps-materials" data-aos="fade-up">
            <h4>Laser Cutting Capacity</h4>
            <div className="row">
              {materials.map((mt) => (
                <div key={mt.name} className="col-6 col-md-4 col-lg-2 ps-material">
                  <strong>{mt.max}</strong>
                  <span>{mt.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section id="production-ramp" className="production-ramp">
        <div className="container" data-aos="fade-up">
          <div className="section-title text-center">
            <h2>FROM DRAWING TO DISPATCH</h2>
            <a href={QUOTE} {...EXT} className="btn btn-primary">
              Request a Quotation
            </a>
          </div>
          <div className="row justify-content-center mt-4">
            {STEPS.map((s, n) => (
              <div className="col-md-3 col-6 step" key={s.icon}>
                <div className="step-number">{n + 1}</div>
                <i className={`bx ${s.icon} ps-step-icon`} aria-hidden="true" />
                <p>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="secure d-flex justify-content-center align-items-center" data-aos="fade-up">
            <i className="bx bxs-lock" aria-hidden="true" />
            <div className="lock">
              <p>Your drawings stay confidential and are used only for your job</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industry" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Industries
              <br />
              <span>We Serve</span>
            </h3>
          </div>
          <div className="row">
            {industries.map((title, i) => (
              <div
                key={title}
                className="col-lg-3 col-md-4 col-sm-6 col-xs-12 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div className="box-img">
                  <i className={`bx ${INDUSTRY_ICONS[i % INDUSTRY_ICONS.length]} ps-icon`} aria-hidden="true" />
                  <h6>{title}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessCarousel />

      {/* Why us */}
      <section id="whyus" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Why Choose <span>PS Laser</span>
            </h3>
          </div>
          <div className="row">
            {whyUs.map((title, i) => (
              <div
                key={title}
                className="col-lg-4 col-md-4 col-sm-6 col-xs-12 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div className="box-img">
                  <i className={`bx ${WHY_ICONS[i % WHY_ICONS.length]} ps-icon`} aria-hidden="true" />
                  <h6>{title}</h6>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title ps-subtitle">
            <h3>
              Quality <span>Inspection</span>
            </h3>
          </div>
          <div className="row">
            {quality.map((q) => (
              <div
                key={q.title}
                className="col-lg-3 col-md-3 col-6 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div className="box-img ps-quality">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.image} alt={q.title} loading="lazy" />
                  <h6>{q.title}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <section id="getintouch" className="services">
        <div className="container" data-aos="fade-in">
          <div className="row">
            <div className="text-contain col-12 align-items-center justify-content-center">
              <h4 id="intouch-text" className="info col-md-3">
                Get In Touch
              </h4>
              <a href={`tel:${contacts[0].tel}`} className="btn btn-primary info col-12 col-md-3">
                <i className="bx bxs-phone" aria-hidden="true" />
                <h4>{contacts[0].phone}</h4>
              </a>
              <a href={`mailto:${company.email}`} className="btn btn-primary info col-12 col-md-3">
                <i className="bx bxs-envelope" aria-hidden="true" />
                <h4>{company.email}</h4>
              </a>
              <a href={QUOTE} {...EXT} className="btn btn-primary info col-12 col-md-2">
                <i className="bx bxl-whatsapp" aria-hidden="true" />
                <h4>WhatsApp</h4>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="gallery" className="services">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Parts &amp; <span>Products We Make</span>
            </h3>
          </div>
          <div className="row">
            {products.map((p) => (
              <div
                key={p.title}
                className="col-lg-3 col-md-4 col-sm-6 col-xs-12 d-flex align-items-stretch mt-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                <div className="box-img ps-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} className="img-fluid ps-card-img" alt={p.title} loading="lazy" />
                  <h6 className="mt-3">{p.title}</h6>
                  <div className="ps-card-actions">
                    <a href={whatsapp(productQuote(p.title))} {...EXT} className="btn btn-primary">
                      Get Quote
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section id="gallery-preview" className="services section-bg ps-gallery-preview">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              From Our <span>Gallery</span>
            </h3>
          </div>
          <div className="row">
            {GALLERY_PREVIEW.map((g, i) => (
              <div key={g.title} className="col-lg-3 col-6 mt-4" data-aos="fade-up" data-aos-delay={i * 80}>
                <Link href={routes.gallery} className="ps-gp-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image} alt={g.title} loading="lazy" />
                  <span>{g.title}</span>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href={routes.gallery} className="btn btn-primary ps-btn-wide">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Blog / pattern / contact teasers */}
      <section id="explore-more" className="services ps-teasers">
        <div className="container" data-aos="fade-up">
          <div className="row">
            {TEASERS.map((t, i) => (
              <div key={t.href} className="col-lg-4 col-md-4 mt-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay={i * 100}>
                <Link href={t.href} className="box-img ps-teaser">
                  <i className={`bx ${t.icon} ps-icon`} aria-hidden="true" />
                  <h4>{t.title}</h4>
                  <p>{t.text}</p>
                  <span className="ps-teaser-cta">
                    {t.cta} <i className="bx bx-right-arrow-alt" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
