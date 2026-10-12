"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { GENERAL_QUOTE_MESSAGE, company, contacts, machines, whatsapp } from "@/lib/pslaser/data";
import styles from "./advanced.module.css";

const QUOTE = whatsapp(GENERAL_QUOTE_MESSAGE);
const primary = contacts.find((c) => c.primary) ?? contacts[0];

const links = [
  { label: "About", href: "#about-us" },
  { label: "Services", href: "#our-services" },
  { label: "Process", href: "#process" },
  { label: "Our Work", href: "#work" },
  { label: "Contact", href: "#contact-us" },
];

function Brand({ small }: { small?: boolean }) {
  return (
    <>
      <span className={styles.brandBadge}>
        <Image
          src={company.logo}
          alt=""
          width={40}
          height={36}
          preload={!small}
        />
      </span>
      <span className={styles.brandText}>
        <strong>PS LASER</strong>
        <small>{company.locationLabel}</small>
      </span>
    </>
  );
}

export function AdvHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1140 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={styles.header} data-scrolled={scrolled}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <a href="#top" className={styles.brand} aria-label="PS Laser, back to top">
            <Brand />
          </a>

          <nav className={styles.nav} aria-label="Primary">
            <div className={styles.navItem}>
              <a className={styles.navLink} href="#top">
                Home
              </a>
            </div>
            {links.slice(0, 2).map((l) => (
              <div className={styles.navItem} key={l.label}>
                <a className={styles.navLink} href={l.href}>
                  {l.label}
                </a>
              </div>
            ))}
            <div className={styles.navItem}>
              <a className={styles.navLink} href="#machines" aria-haspopup="true">
                Machines <ChevronDown aria-hidden />
              </a>
              <div className={styles.mega}>
                <div className={`${styles.megaGrid} ${styles.megaGridTwo}`}>
                  {machines.map((m) => (
                    <a key={m.slug} className={styles.megaLink} href={`#m-${m.slug}`}>
                      {m.shortName}
                      <small>{m.category}</small>
                    </a>
                  ))}
                </div>
                <div className={styles.megaFoot}>
                  <a href="#machines">All machines</a>
                  <a href="#capacity">Cutting capacity</a>
                </div>
              </div>
            </div>
            {links.slice(2).map((l) => (
              <div className={styles.navItem} key={l.label}>
                <a className={styles.navLink} href={l.href}>
                  {l.label}
                </a>
              </div>
            ))}
          </nav>

          <a
            href={QUOTE}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.headerCta}`}
          >
            Get Quote <ArrowRight aria-hidden />
          </a>

          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="ps-adv-drawer"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
        </div>
      </header>

      <div
        id="ps-adv-drawer"
        className={styles.drawer}
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
      >
        <div className={`${styles.wrap} ${styles.drawerTop}`}>
          <span className={styles.brand}>
            <Brand small />
          </span>
          <button type="button" className={styles.menuBtn} aria-label="Close menu" onClick={close}>
            <X />
          </button>
        </div>
        <div className={`${styles.wrap} ${styles.drawerBody}`}>
          <a className={styles.drawerLink} href="#top" onClick={close}>
            Home
          </a>
          {links.slice(0, 2).map((l) => (
            <a key={l.label} className={styles.drawerLink} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <details>
            <summary className={styles.drawerSummary}>
              Machines <ChevronDown aria-hidden />
            </summary>
            <div className={styles.drawerSub}>
              <a href="#machines" onClick={close}>
                All machines
              </a>
              {machines.map((m) => (
                <a key={m.slug} href={`#m-${m.slug}`} onClick={close}>
                  {m.name}
                </a>
              ))}
            </div>
          </details>
          {links.slice(2).map((l) => (
            <a key={l.label} className={styles.drawerLink} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <div className={styles.drawerCta}>
            <a href={QUOTE} target="_blank" rel="noopener noreferrer" className={styles.btn}>
              Get Quote on WhatsApp <ArrowRight aria-hidden />
            </a>
            <a href={`tel:${primary.tel}`} className={styles.btnGhost}>
              <Phone aria-hidden /> {primary.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
