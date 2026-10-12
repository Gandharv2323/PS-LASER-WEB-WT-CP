import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import {
  BadgeCheck,
  Cpu,
  Crosshair,
  Droplets,
  Handshake,
  Ruler,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { BrandStrip } from "@/components/site/brand-strip";
import { Button, WhatsAppButton } from "@/components/site/button";
import { ContactDetails } from "@/components/site/contact-details";
import { CTABand } from "@/components/site/cta-band";
import { HeroVideo } from "@/components/site/hero-video";
import { GalleryGrid, type GalleryItem } from "@/components/site/lightbox";
import { MachineCard } from "@/components/site/machine-card";
import { MapEmbed } from "@/components/site/map-embed";
import { MaterialCapacity } from "@/components/site/material-capacity";
import { ProcessSteps } from "@/components/site/process-steps";
import { Section, SectionHeading } from "@/components/site/section";
import { ServiceCard } from "@/components/site/service-card";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  industries,
  machines,
  products,
  quality,
  services,
  whyUs,
} from "@/lib/pslaser/data";
import { routes } from "@/lib/site/nav";
import styles from "./home.module.css";

const DESCRIPTION =
  "PS Laser is a sheet metal job shop at Velu, Bhor, Pune: 3 kW and 1.5 kW fiber laser cutting, 175 T CNC bending, Amada turret punching, laser welding, fabrication and 9-tank powder coating. Send your drawing on WhatsApp for a quote.";

export const metadata: Metadata = {
  title: { absolute: "PS Laser | Precision Sheet Metal & CNC Laser Cutting in Pune" },
  description: DESCRIPTION,
  openGraph: {
    title: "PS Laser — Precision sheet metal, cut and formed to your drawing",
    description: DESCRIPTION,
    siteName: "PS Laser",
    type: "website",
    locale: "en_IN",
  },
};

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;
const revealAt = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

const HERO_SPECS = [
  { value: "3 kW", label: "Fiber laser power" },
  { value: "3 × 1.5 m", label: "Laser cutting bed" },
  { value: "175 T", label: "CNC press brake" },
  { value: "9-tank", label: "Pre-treatment line" },
];

const TECH_FACTS = [
  { value: "2", label: "Fiber lasers — HSG 3 kW and Genesis 1.5 kW" },
  { value: "3 × 1.5 m", label: "Cutting bed on both lasers" },
  { value: "40", label: "Stations on the Amada 32 T turret punch" },
  { value: "1–12 mm", label: "Bending range on the 175 T × 3 m press brake" },
];

const WHY_ICONS = [BadgeCheck, Cpu, Users, Wrench, Crosshair, Handshake];

const PRODUCT_TAGS: Record<string, string> = {
  "Industrial Enclosures": "Laser cutting",
  "Control Panel Housings": "Sheet metal",
  "Precision Brackets": "CNC bending",
  "Machine Guards": "Fabrication",
  "Custom Fixtures": "Welding",
  "Powder Coated Parts": "Powder coating",
  "Laser Cut Jaali Patterns": "Laser cutting",
  "Structural Fabrication": "Fabrication",
};

const galleryPreview: GalleryItem[] = products.slice(0, 6).map((p) => ({
  src: p.image,
  alt: `${p.title} (representative image)`,
  title: p.title,
  tag: PRODUCT_TAGS[p.title],
  caption: "Representative work",
}));

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className={`s-tone-ink ${styles.hero}`} aria-labelledby="home-title">
        <HeroVideo
          src={company.heroVideo}
          poster="/sites/pslaser/factory/website-hero-laser-head-ai.jpg"
          className="s-enter-fade"
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`s-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className="s-eyebrow s-enter" style={delay(80)}>
              Sheet metal job shop · Velu, Bhor, Pune
            </p>
            <h1 id="home-title" className={`s-display s-enter ${styles.heroTitle}`} style={delay(160)}>
              Precision sheet metal, <span className={styles.heroAccent}>cut and formed</span> to your drawing.
            </h1>
            <p className={`s-lead s-enter ${styles.heroLead}`} style={delay(280)}>
              Fiber laser cutting, CNC bending, turret punching, laser welding and powder coating —
              one shop and one point of contact, from DXF to finished part.
            </p>
            <div className="s-btn-row s-btn-row--stack s-enter" style={delay(380)}>
              <WhatsAppButton size="lg" message={GENERAL_QUOTE_MESSAGE} />
              <Button href="#capabilities" variant="light" size="lg" arrow>
                Explore capabilities
              </Button>
            </div>
          </div>

          <dl className={`s-enter ${styles.heroSpecs}`} style={delay(520)}>
            {HERO_SPECS.map((s) => (
              <div key={s.label} className={styles.heroSpec}>
                <dt>{s.label}</dt>
                <dd className="s-num">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------- Capabilities */}
      <Section id="capabilities" tone="paper">
        <SectionHeading
          eyebrow="What we do"
          title="Eight capabilities. One shop floor."
          intro="Parts move from programming to cutting, forming, joining and finishing without leaving our facility — fewer hand-offs and tighter control over every dimension."
          layout="split"
          action={
            <>
              <Button href={routes.engineering} variant="secondary" arrow>
                Engineering services
              </Button>
              <Button href={routes.architectural} variant="link">
                Architectural work
              </Button>
            </>
          }
        />
        <div className={styles.serviceGrid}>
          {services.map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} revealDelay={(i % 4) * 80} />
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ Technology */}
      <Section id="technology" tone="ink">
        <div className={styles.techGrid}>
          <div className={styles.techCopy}>
            <SectionHeading
              eyebrow="Capabilities & technology"
              title="Sized for real production work."
              intro="Two fiber lasers with full 3 m × 1.5 m beds handle everything from thin enclosure panels to 16 mm mild steel plate. Turret punching and CNC forming take the part the rest of the way."
              className={styles.techHeading}
            />
            <dl className={`s-rule-grid ${styles.techFacts}`}>
              {TECH_FACTS.map((f, i) => (
                <div key={f.label} className={styles.techFact} data-reveal="fade" style={revealAt(i * 80)}>
                  <dt>{f.label}</dt>
                  <dd className="s-num">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.techCapacity} data-reveal>
            <h3 className={`s-h3 ${styles.capTitle}`}>Laser cutting capacity</h3>
            <MaterialCapacity />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- Machinery */}
      <Section id="machinery" tone="paper-2">
        <SectionHeading
          eyebrow="Machinery"
          title="The equipment behind every part."
          intro="Seven machines and lines on our floor. Each has its own quote request — tell us the material, thickness and quantity and we will come back with a price."
          layout="split"
        />
        <div className={styles.machineGrid}>
          {machines.map((m, i) => (
            <MachineCard
              key={m.slug}
              machine={m}
              index={i}
              featured={i === 0}
              revealDelay={(i % 4) * 80}
            />
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Brand strip */}
      <BrandStrip />

      {/* ----------------------------------------------------------- About */}
      <Section id="about" tone="paper">
        <div className={styles.about}>
          <figure className={styles.aboutMedia} data-reveal="scale">
            <div className="s-media" style={{ "--ratio": "941 / 517" } as CSSProperties}>
              <Image
                src={company.factoryPhoto}
                alt="PS Laser factory building and signboard at Velu, Bhor, Pune"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>
            <figcaption className={styles.aboutCaption}>Our facility · {company.locationLabel}</figcaption>
          </figure>
          <div className={styles.aboutCopy} data-reveal>
            <p className="s-eyebrow">About PS Laser</p>
            <h2 className="s-h2">Built around the drawing, not the catalogue.</h2>
            <p className="s-lead">{company.about}</p>
            <p className={styles.aboutMission}>
              <strong>Our mission</strong>
              {company.mission}
            </p>
            <div className="s-btn-row">
              <Button href={routes.about} variant="dark" arrow>
                About us
              </Button>
              <Button href={routes.contact} variant="link">
                Visit the facility
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- Why us */}
      <Section id="why" tone="white">
        <SectionHeading
          eyebrow="Why PS Laser"
          title="What you get when you send us a job."
          layout="split"
          intro="Branded machines, proper CAM software and people who check the drawing before they cut."
        />
        <ul className={`s-rule-grid ${styles.whyGrid}`}>
          {whyUs.map((w, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <li key={w} className={styles.why} data-reveal="fade" style={revealAt((i % 3) * 90)}>
                <span className={styles.whyTop}>
                  <Icon aria-hidden="true" />
                  <span className={styles.whyNum}>{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className={styles.whyText}>{w}</span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ------------------------------------------------------ Industries */}
      <Section id="industries" tone="paper">
        <div className={styles.industries}>
          <SectionHeading
            eyebrow="Industries"
            title="Work we are set up for."
            intro="Typical applications for our cutting, forming and finishing — if your part is sheet metal, ask us."
            className={styles.industriesHead}
          />
          <ol className={styles.industryList}>
            {industries.map((name, i) => (
              <li key={name} data-reveal="left" style={revealAt(i * 70)}>
                <span className={styles.industryNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.industryName}>{name}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* --------------------------------------------------------- Quality */}
      <Section id="quality" tone="ink">
        <SectionHeading
          eyebrow="Quality"
          title="Finished properly. Checked before dispatch."
          layout="split"
          intro="Surface preparation and inspection are part of the job, not an afterthought."
        />
        <div className={styles.qualityGrid}>
          <article className={styles.qualityCard} data-reveal>
            <Droplets aria-hidden="true" />
            <p className={`s-num ${styles.qualityValue}`}>9-tank</p>
            <h3 className={styles.qualityTitle}>Pre-treatment before coating</h3>
            <p className={styles.qualityText}>
              PLC-based powder coating plant: pre-treatment, oven drying at 120 °C, an SS booth with a
              Wagner gun for quick colour change, then oven curing.
            </p>
          </article>
          <article className={styles.qualityCard} data-reveal style={revealAt(90)}>
            <ShieldCheck aria-hidden="true" />
            <p className={`s-num ${styles.qualityValue}`}>900–1000 h</p>
            <h3 className={styles.qualityTitle}>Salt spray endurance</h3>
            <p className={styles.qualityText}>
              Coated parts are prepared to sustain 900–1000 hours in salt spray testing.
            </p>
          </article>
          <article className={styles.qualityCard} data-reveal style={revealAt(180)}>
            <Ruler aria-hidden="true" />
            <p className={`s-num ${styles.qualityValue}`}>In-house</p>
            <h3 className={styles.qualityTitle}>Dimensional inspection</h3>
            <ul className={styles.instruments}>
              {quality.map((q) => (
                <li key={q.title}>
                  <span className={styles.instrumentImg}>
                    <Image src={q.image} alt="" fill sizes="44px" />
                  </span>
                  {q.title}
                </li>
              ))}
              <li>
                <span className={styles.instrumentDot} aria-hidden="true" />
                Measuring tape
              </li>
            </ul>
          </article>
        </div>
      </Section>

      {/* --------------------------------------------------------- Gallery */}
      <Section id="work" tone="paper">
        <SectionHeading
          eyebrow="Selected work"
          title="Parts and finishes we produce."
          layout="split"
          intro="Representative examples of the kind of parts we cut, form, weld and coat. Images are illustrative."
          action={
            <Button href={routes.gallery} variant="secondary" arrow>
              View the gallery
            </Button>
          }
        />
        <GalleryGrid items={galleryPreview} minColumn={280} feature />
      </Section>

      {/* --------------------------------------------------------- Process */}
      <Section id="process" tone="paper-2">
        <SectionHeading
          eyebrow="How a job runs"
          title="From drawing to dispatch."
          layout="split"
          intro="Send a DXF, PDF or sketch on WhatsApp. We confirm material and quantity, quote, and take it through the same six steps every time."
        />
        <ProcessSteps />
      </Section>

      {/* --------------------------------------------------------- Contact */}
      <CTABand
        eyebrow="Start a job"
        title="Have a drawing? Get a price on WhatsApp."
        text="Share the DXF or drawing with material, thickness and quantity. Your files stay confidential."
        secondary={{ href: `tel:${contacts[0].tel}`, label: `Call ${contacts[0].phone}` }}
      />
      <Section id="contact" tone="paper">
        <div className={styles.contact}>
          <div className={styles.contactCopy} data-reveal>
            <p className="s-eyebrow">Contact</p>
            <h2 className="s-h2">Talk to the shop directly.</h2>
            <p className="s-lead">
              Call any of our team, email your drawings, or drop in at the facility in Velu.
            </p>
            <ContactDetails />
            <Button href={routes.contact} variant="link">
              All contact options
            </Button>
          </div>
          <div data-reveal style={revealAt(120)}>
            <MapEmbed />
          </div>
        </div>
      </Section>
    </>
  );
}
