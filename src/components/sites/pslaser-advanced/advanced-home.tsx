import Image from "next/image";
import Link from "next/link";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import {
  Armchair,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  Cog,
  Cpu,
  Crosshair,
  Factory,
  FileText,
  Flame,
  Gauge,
  Grid3x3,
  Hammer,
  Layers,
  Mail,
  MapPin,
  PaintBucket,
  PenTool,
  Phone,
  Receipt,
  Ruler,
  ShieldCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  industries,
  machines,
  materials,
  process,
  quality,
  services,
  stats,
  whatsapp,
  whyUs,
} from "@/lib/pslaser/data";
import { AdvHeader } from "./adv-header";
import { Counter } from "./counter";
import { HeroSlides } from "./hero-slides";
import { RevealRoot } from "./reveal-root";
import { WorkSlider } from "./work-slider";
import s from "./advanced.module.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-adv-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-adv-mono",
  weight: ["400", "500"],
  display: "swap",
});

const LASER_QUOTE = machines[0].quoteMessage;
const POWDER_QUOTE = machines[machines.length - 1].quoteMessage;
const primary = contacts.find((c) => c.primary) ?? contacts[0];

/** Props for every outbound WhatsApp link. */
const wa = (message: string) => ({
  href: whatsapp(message),
  target: "_blank",
  rel: "noopener noreferrer",
});

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const serviceIcons: Record<string, LucideIcon> = {
  "laser-cutting": Crosshair,
  "cnc-bending": Layers,
  "turret-punching": Grid3x3,
  "laser-welding": Flame,
  fabrication: Hammer,
  "powder-coating": PaintBucket,
  "design-cam": PenTool,
  architectural: Building2,
};

const processIcons: LucideIcon[] = [PenTool, Crosshair, Layers, Flame, PaintBucket, ClipboardCheck];
const industryIcons: LucideIcon[] = [Factory, Zap, Cog, Building2, Armchair];

const marqueeItems = [
  "HSG",
  "Amada",
  "Genesis",
  "Fiber Laser",
  "CNC Bending",
  "Turret Punching",
  "Laser Welding",
  "Powder Coating",
];

const camSoftware = [
  { name: "Production Designer", use: "Blank development & bending simulation" },
  { name: "Sheet Works", use: "Sheet metal parts & 3D modelling" },
  { name: "Blank CAM", use: "Nesting & laser cutting programming" },
];

const coreValues = ["Customer Satisfaction", "Integrity", "Innovation", "Quality", "Efficiency"];

/** "3 kW" -> { to: 3, unit: " kW" }; returns null for non-numeric values. */
function splitStat(value: string): { to: number; unit: string } | null {
  const m = /^(\d+)(.*)$/.exec(value);
  return m ? { to: Number(m[1]), unit: m[2] } : null;
}

function SectionHead({
  eyebrow,
  title,
  accent,
  lead,
  aside,
  id,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className={s.sectionHead} data-reveal="">
      <div>
        <span className={s.eyebrow}>{eyebrow}</span>
        <h2 className={s.h2} id={id}>
          {title} {accent && <span>{accent}</span>}
        </h2>
        {lead && <p className={s.lead}>{lead}</p>}
      </div>
      {aside}
    </div>
  );
}

function Hero() {
  return (
    <section className={s.hero} id="top" aria-labelledby="ps-adv-h1">
      <video
        className={s.heroVideo}
        src={company.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className={s.heroGrid} aria-hidden />
      <div className={s.heroGlow} aria-hidden />
      <div className={s.heroGlow2} aria-hidden />
      <div className={s.laser} aria-hidden />
      <div className={s.wrap}>
        <div className={s.heroInner}>
          <div>
            <div className={`${s.badge} ${s.in}`}>
              <b>
                <BadgeCheck aria-hidden /> {company.brand}
              </b>
              <span>Sheet metal &amp; laser cutting · {company.locationLabel}</span>
            </div>
            <h1 id="ps-adv-h1" className={`${s.h1} ${s.in}`} style={delay(80)}>
              Manufacturer of <em>Precision Engineering</em> &amp; Sheet Metal Components
            </h1>
            <p className={`${s.heroSub} ${s.in}`} style={delay(160)}>
              {company.subTagline} Laser cutting, CNC bending, turret punching, welding and powder
              coating — all under one roof.
            </p>
            <div className={`${s.heroCtas} ${s.in}`} style={delay(240)}>
              <a {...wa(GENERAL_QUOTE_MESSAGE)} className={s.btn}>
                Get Quote on WhatsApp <ArrowRight aria-hidden />
              </a>
              <a href="#machines" className={s.btnGhost}>
                View Machines
              </a>
            </div>
            <p className={`${s.secure} ${s.in}`} style={delay(320)}>
              <FileText aria-hidden /> Send your DXF / drawing on WhatsApp for a quick quotation
            </p>
          </div>

          <div className={`${s.heroVisual} ${s.inScale}`} style={delay(200)}>
            <div className={s.frame}>
              <HeroSlides />
            </div>
            <div className={`${s.floatCard} ${s.floatA}`}>
              <span className={s.floatIcon}>
                <Crosshair aria-hidden />
              </span>
              <span>
                <strong>3 kW Fiber Laser</strong>
                <small>HSG · 3 m x 1.5 m bed</small>
              </span>
            </div>
            <div className={`${s.floatCard} ${s.floatB}`}>
              <span className={s.floatIcon}>
                <Layers aria-hidden />
              </span>
              <span>
                <strong>175 T Press Brake</strong>
                <small>CNC bending · 3 m length</small>
              </span>
            </div>
          </div>
        </div>

        <dl className={s.stats}>
          {stats.map((st, i) => {
            const n = splitStat(st.value);
            return (
              <div className={s.stat} key={st.label} data-reveal="" style={delay(i * 70)}>
                <dt className={s.statNum}>
                  {n ? (
                    <>
                      <Counter to={n.to} />
                      {n.unit && <span className={s.statUnit}>{n.unit.replace(/^-/, " ")}</span>}
                    </>
                  ) : (
                    st.value
                  )}
                </dt>
                <dd className={s.statLabel}>{st.label}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function Capabilities() {
  const items = (key: string) => (
    <div className={s.marqueeGroup} key={key} aria-hidden={key === "b"}>
      {marqueeItems.map((m) => (
        <span className={s.mItem} key={m}>
          {m}
        </span>
      ))}
    </div>
  );
  return (
    <section className={s.trusted} aria-label="Machine brands and capabilities">
      <div className={`${s.wrap} ${s.trustedInner}`}>
        <div className={s.trustedLabel}>
          <p>
            <strong>{machines.length}</strong>Machines &amp; plants in-house
          </p>
          <p>
            <strong>{materials.length}</strong>Metals laser cut
          </p>
        </div>
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>{["a", "b"].map(items)}</div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={s.section} id="about-us" aria-label="About PS Laser">
      <div className={`${s.wrap} ${s.splitList}`}>
        <div className={s.split}>
          <div className={s.splitMedia} data-reveal="scale">
            <Image
              src={company.factoryPhoto}
              alt="PS Laser plant and signboard at Velu, Pune"
              width={941}
              height={517}
              sizes="(min-width: 960px) 50vw, 100vw"
            />
            <span className={s.splitTag}>Our plant · Velu, Pune</span>
          </div>
          <div data-reveal="" style={delay(120)}>
            <span className={s.splitNum}>01 — ABOUT US</span>
            <h2 className={s.splitTitle}>Precision sheet metal components, made under one roof.</h2>
            <p className={s.splitText}>{company.about}</p>
            <div className={s.chips}>
              {services.slice(0, 6).map((sv) => (
                <a key={sv.slug} className={s.chip} href="#our-services">
                  <Check aria-hidden />
                  {sv.title}
                </a>
              ))}
            </div>
            <div className={s.splitCta}>
              <a className={s.linkArrow} href="#machines">
                See our machines <ArrowUpRight aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className={`${s.split} ${s.splitReverse}`}>
          <div className={s.splitMedia} data-reveal="scale">
            <Image
              src="/sites/pslaser/services/cnc-turret-punching-parts.jpg"
              alt="CNC turret punched sheet metal parts"
              width={1179}
              height={739}
              sizes="(min-width: 960px) 50vw, 100vw"
            />
            <span className={s.splitTag}>Mission &amp; Vision</span>
          </div>
          <div data-reveal="" style={delay(120)}>
            <span className={s.splitNum}>02 — MISSION</span>
            <h2 className={s.splitTitle}>{company.mission}</h2>
            <p className={s.splitText}>
              <strong>Vision — </strong>
              {company.vision}
            </p>
            <div className={s.chips}>
              {coreValues.map((v) => (
                <span key={v} className={s.chip}>
                  <BadgeCheck aria-hidden />
                  {v}
                </span>
              ))}
            </div>
            <div className={s.splitCta}>
              <a className={s.linkArrow} {...wa(GENERAL_QUOTE_MESSAGE)}>
                Talk to us on WhatsApp <ArrowUpRight aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className={s.section} id="our-services" style={{ paddingTop: 0 }} aria-labelledby="ps-adv-services">
      <div className={s.wrap}>
        <SectionHead
          id="ps-adv-services"
          eyebrow="What we do"
          title="Our"
          accent="Services"
          lead="Eight in-house services — cut, punch, bend, weld, coat and engineer your parts from drawing to dispatch."
          aside={
            <a className={s.btn} {...wa(GENERAL_QUOTE_MESSAGE)}>
              Get Quote on WhatsApp <ArrowRight aria-hidden />
            </a>
          }
        />
        <div className={s.capGrid}>
          {services.map((sv, i) => {
            const Icon = serviceIcons[sv.slug] ?? Cog;
            return (
              <article className={s.capCard} key={sv.slug} data-reveal="" style={delay((i % 4) * 80)}>
                <div className={s.capMedia}>
                  <div className={s.capImg}>
                    <Image src={sv.image} alt={sv.title} fill sizes="(min-width: 1200px) 25vw, (min-width: 560px) 50vw, 100vw" />
                  </div>
                  <span className={s.capIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={s.capIcon}>
                    <Icon aria-hidden />
                  </span>
                </div>
                <div className={s.capBody}>
                  <h3 className={s.capTitle}>{sv.title}</h3>
                  <p className={s.capText}>{sv.text}</p>
                  <div className={s.capActions}>
                    <a className={s.capQuote} {...wa(sv.quoteMessage)} aria-label={`Get quote for ${sv.title} on WhatsApp`}>
                      Get Quote
                    </a>
                    <a className={s.capMore} href="#machines">
                      Machines <ArrowUpRight aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Machines() {
  const maxMm = Math.max(...materials.map((m) => parseFloat(m.max)));
  return (
    <section className={`${s.section} ${s.machinesSection}`} id="machines" aria-labelledby="ps-adv-machines">
      <div className={s.wrap}>
        <SectionHead
          id="ps-adv-machines"
          eyebrow="Infrastructure"
          title="Our"
          accent="Machines"
          lead="Branded, precision machines on our shop floor — tap any machine to get a quote on WhatsApp."
        />
        <div className={s.machGrid}>
          {machines.map((m, i) => (
            <article
              className={s.mach}
              key={m.slug}
              id={`m-${m.slug}`}
              data-reveal=""
              style={delay((i % 3) * 90)}
            >
              <div className={s.machMedia}>
                <Image src={m.image} alt={m.name} fill sizes="(min-width: 1100px) 33vw, (min-width: 680px) 50vw, 100vw" />
                <span className={s.machTag}>{m.category}</span>
                <span className={s.machNo}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className={s.machBody}>
                <h3 className={s.machTitle}>{m.name}</h3>
                <ul className={s.machSpecs}>
                  {m.specs.map((sp) => (
                    <li key={sp}>
                      <Check aria-hidden />
                      {sp}
                    </li>
                  ))}
                </ul>
                <a className={`${s.btn} ${s.machCta}`} {...wa(m.quoteMessage)} aria-label={`Get quote on WhatsApp for ${m.name}`}>
                  Get Quote on WhatsApp <ArrowRight aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className={s.capacity} id="capacity" data-reveal="scale">
          <div className={s.capacityHead}>
            <span className={s.eyebrow}>Laser cutting capacity</span>
            <h3 className={s.capacityTitle}>
              Maximum thickness we cut <span>by material</span>
            </h3>
            <p className={s.capacityText}>
              Fiber laser cutting on 3 m x 1.5 m beds (HSG 3 kW + Genesis 1.5 kW).
            </p>
            <a className={s.btn} {...wa(LASER_QUOTE)}>
              Get Laser Cutting Quote <ArrowRight aria-hidden />
            </a>
          </div>
          <ul className={s.bars}>
            {materials.map((m, i) => {
              const mm = parseFloat(m.max);
              return (
                <li key={m.name} className={s.bar}>
                  <span className={s.barLabel}>
                    {m.name}
                    <b>{m.max}</b>
                  </span>
                  <span className={s.barTrack}>
                    <span
                      className={s.barFill}
                      data-reveal="fade"
                      style={{ ...delay(200 + i * 120), "--w": `${(mm / maxMm) * 100}%` } as CSSProperties}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className={`${s.section} ${s.dark} ${s.process}`} id="process" aria-labelledby="ps-adv-process">
      <div className={s.wrap}>
        <div className={s.processHead} data-reveal="">
          <span className={s.eyebrow}>How it works</span>
          <h2 className={s.h2} id="ps-adv-process">
            From drawing to <span>dispatch</span>
          </h2>
          <p className={s.lead}>Six controlled steps, all in-house at our Velu plant.</p>
          <a {...wa(GENERAL_QUOTE_MESSAGE)} className={s.btn}>
            Start on WhatsApp <ArrowRight aria-hidden />
          </a>
        </div>
        <div className={s.stepsWrap}>
          <span className={s.stepsLine} data-reveal="fade" aria-hidden />
          <ol className={s.steps}>
            {process.map((st, i) => {
              const Icon = processIcons[i] ?? Cog;
              return (
                <li className={s.step} key={st.title} data-reveal="" style={delay(i * 120)}>
                  <span className={s.stepIcon}>
                    <Icon aria-hidden />
                    <span className={s.stepNo}>{i + 1}</span>
                  </span>
                  <div>
                    <h3 className={s.stepTitle}>{st.title}</h3>
                    <p className={s.stepText}>{st.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <p className={`${s.secure} ${s.processSecure}`} data-reveal="fade">
          <FileText aria-hidden /> Share your DXF, DWG or PDF drawing on WhatsApp to get started
        </p>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section className={s.section} aria-labelledby="ps-adv-ind">
      <div className={s.wrap}>
        <SectionHead
          id="ps-adv-ind"
          eyebrow="Sectors"
          title="Industries"
          accent="We Serve"
          lead="Precision sheet metal components for industrial and OEM clients."
        />
        <div className={s.indGrid}>
          {industries.map((ind, i) => {
            const Icon = industryIcons[i] ?? Factory;
            return (
              <div className={s.ind} key={ind} data-reveal="" style={delay((i % 5) * 60)}>
                <span className={s.indIcon}>
                  <Icon aria-hidden />
                </span>
                <h3 className={s.indTitle}>{ind}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className={s.section} id="work" style={{ paddingTop: 0 }} aria-labelledby="ps-adv-work">
      <div className={s.wrap}>
        <SectionHead id="ps-adv-work" eyebrow="Our work" title="What we" accent="manufacture" />
        <div data-reveal="scale">
          <WorkSlider />
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className={s.section} style={{ paddingTop: 0 }} aria-labelledby="ps-adv-why">
      <div className={s.wrap}>
        <SectionHead id="ps-adv-why" eyebrow="Why PS Laser" title="Why" accent="Us?" />
        <div className={s.bento}>
          <div className={`${s.tile} ${s.tileDark} ${s.bentoWide}`} data-reveal="">
            <span className={s.tileIcon}>
              <Cog aria-hidden />
            </span>
            <h3 className={s.tileTitle}>Branded, Precision Machines</h3>
            <p className={s.tileText}>
              HSG &amp; Genesis fiber lasers, Amada CNC turret punches, a 175 T CNC press brake and an HSG
              handheld laser welder.
            </p>
            <div className={s.tileBig}>
              3<sup>kW</sup>
            </div>
            <p className={s.tileText}>Fiber laser · MS up to 16 mm</p>
          </div>

          <div className={s.tile} data-reveal="" style={delay(80)}>
            <span className={s.tileIcon}>
              <Ruler aria-hidden />
            </span>
            <h3 className={s.tileTitle}>In-house Quality Room</h3>
            <p className={s.tileText}>Close-tolerance parts, inspected before dispatch.</p>
            <div className={s.qGrid}>
              {quality.map((q) => (
                <figure key={q.title} className={s.qItem}>
                  <span className={s.qImg}>
                    <Image src={q.image} alt="" fill sizes="80px" />
                  </span>
                  <figcaption>{q.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className={`${s.tile} ${s.tileAccent}`} data-reveal="" style={delay(160)}>
            <span className={s.tileIcon}>
              <ShieldCheck aria-hidden />
            </span>
            <h3 className={s.tileTitle}>Powder Coating That Lasts</h3>
            <p className={s.tileText}>PLC plant · 9-tank pre-treatment · SS booth for quick colour change</p>
            <div className={s.tileBig}>
              900–1000<sup>h</sup>
            </div>
            <p className={s.tileText}>Salt spray test</p>
            <a className={s.tileLink} {...wa(POWDER_QUOTE)}>
              Get powder coating quote <ArrowUpRight aria-hidden />
            </a>
          </div>

          <div className={`${s.tile} ${s.bentoWide}`} data-reveal="">
            <span className={s.tileIcon}>
              <Workflow aria-hidden />
            </span>
            <h3 className={s.tileTitle}>End-to-End, Under One Roof</h3>
            <p className={s.tileText}>Assistance from design to installation of your project.</p>
            <div className={s.flow}>
              {process.map((p, i) => (
                <span key={p.title} style={{ display: "contents" }}>
                  {i > 0 && <ArrowRight aria-hidden />}
                  <span>{p.title}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={s.tile} data-reveal="" style={delay(80)}>
            <span className={s.tileIcon}>
              <Cpu aria-hidden />
            </span>
            <h3 className={s.tileTitle}>Advanced CAD-CAM</h3>
            <ul className={s.camList}>
              {camSoftware.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>
                  {c.use}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${s.tile} ${s.tileDark}`} data-reveal="" style={delay(160)}>
            <span className={s.tileIcon}>
              <Gauge aria-hidden />
            </span>
            <h3 className={s.tileTitle}>Why Customers Choose Us</h3>
            <div className={s.miniInd}>
              {whyUs.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className={s.section} id="contact-us" style={{ paddingTop: 0 }} aria-labelledby="ps-adv-cta">
      <div className={s.wrap}>
        <div className={s.ctaBand} data-reveal="scale">
          <div className={s.ctaInner}>
            <div>
              <span className={`${s.eyebrow} ${s.eyebrowLight}`}>Get in touch</span>
              <h2 className={`${s.ctaTitle} ${s.ctaTitleGap}`} id="ps-adv-cta">
                Let&apos;s manufacture your next component.
              </h2>
              <p className={s.ctaText}>
                Send your drawing and quantity on WhatsApp — we&apos;ll reply with a quotation.
              </p>
              <a className={s.waBig} {...wa(GENERAL_QUOTE_MESSAGE)}>
                <span className={s.waIcon}>
                  <Image src={company.whatsappIcon} alt="" width={150} height={150} unoptimized />
                </span>
                <span>
                  <small>Get quote on WhatsApp</small>
                  <strong>{primary.phone}</strong>
                </span>
                <ArrowRight aria-hidden />
              </a>
              <div className={s.ctaMeta}>
                <a href={company.mapUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin aria-hidden />
                  <span>{company.address}</span>
                </a>
                <a href={`mailto:${company.email}`}>
                  <Mail aria-hidden />
                  <span>{company.email}</span>
                </a>
                <p>
                  <Receipt aria-hidden />
                  <span>GSTIN {company.gstin}</span>
                </p>
              </div>
            </div>
            <div className={s.contactList}>
              {contacts.map((c) => (
                <a className={s.contact} href={`tel:${c.tel}`} key={c.tel}>
                  <span className={s.contactIcon}>
                    <Phone aria-hidden />
                  </span>
                  <span>
                    <small>{c.name}</small>
                    <strong>{c.phone}</strong>
                  </span>
                </a>
              ))}
              <a className={s.btnLight} href={company.mapUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps <ArrowUpRight aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const explore = [
    { label: "Home", href: "#top" },
    { label: "About Us", href: "#about-us" },
    { label: "Machines", href: "#machines" },
    { label: "Process", href: "#process" },
    { label: "Our Work", href: "#work" },
    { label: "Contact", href: "#contact-us" },
  ];
  return (
    <footer className={s.footer}>
      <div className={s.wrap}>
        <div className={s.footTop}>
          <div className={s.footBrand}>
            <span className={s.footLogo}>
              <Image src={company.logo} alt="PS Laser logo" width={76} height={68} />
            </span>
            <p className={s.footBrandName}>PS LASER</p>
            <p>
              {company.tagline}.
            </p>
            <div className={s.footContact}>
              <a href={company.mapUrl} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden /> {company.address}
              </a>
              <a href={`mailto:${company.email}`}>
                <Mail aria-hidden /> {company.email}
              </a>
            </div>
          </div>
          <nav aria-label="Explore">
            <h4 className={s.footHead}>Explore</h4>
            <ul className={s.footLinks}>
              {explore.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Services">
            <h4 className={s.footHead}>Services</h4>
            <ul className={`${s.footLinks} ${s.footLinksTwo}`}>
              {services.map((sv) => (
                <li key={sv.slug}>
                  <a href="#our-services">{sv.title}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h4 className={s.footHead}>Call Us</h4>
            <div className={s.footContact}>
              {contacts.map((c) => (
                <a key={c.tel} href={`tel:${c.tel}`}>
                  <Phone aria-hidden /> {c.phone} <small>· {c.name.split(" ")[0]}</small>
                </a>
              ))}
            </div>
            <a className={`${s.btn} ${s.footCta}`} {...wa(GENERAL_QUOTE_MESSAGE)}>
              Get Quote <ArrowRight aria-hidden />
            </a>
          </div>
        </div>
        <div className={s.footBottom}>
          <span>
            © {new Date().getFullYear()} PS Laser · GSTIN {company.gstin}
          </span>
          <Link href="/classic">View classic homepage</Link>
        </div>
        <div className={s.footWord} aria-hidden>
          PS LASER
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a className={s.waFloat} {...wa(GENERAL_QUOTE_MESSAGE)} aria-label="Chat with PS Laser on WhatsApp">
      <span className={s.waIcon}>
        <Image src={company.whatsappIcon} alt="" width={150} height={150} unoptimized />
      </span>
      <span className={s.waFloatLabel}>Get Quote</span>
    </a>
  );
}

export function AdvancedHome() {
  return (
    <RevealRoot className={`${sans.variable} ${mono.variable}`}>
      <AdvHeader />
      <main>
        <Hero />
        <Capabilities />
        <About />
        <Services />
        <Machines />
        <Process />
        <Industries />
        <Work />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </RevealRoot>
  );
}
