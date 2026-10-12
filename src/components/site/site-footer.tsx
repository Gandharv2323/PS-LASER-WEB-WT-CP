import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  mapDirections,
  services,
  whatsapp,
} from "@/lib/pslaser/data";
import { mainNav, serviceHref } from "@/lib/site/nav";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={`s-tone-ink ${styles.footer}`}>
      <div className="s-container">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Logo tone="light" />
            <p className={styles.blurb}>
              Sheet metal job shop at Velu, Bhor, Pune — fiber laser cutting, CNC bending, turret
              punching, welding and powder coating under one roof.
            </p>
            <a
              href={whatsapp(GENERAL_QUOTE_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="s-btn"
            >
              <WhatsAppIcon />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <nav className={styles.col} aria-label="Footer">
            <h2 className={styles.colTitle}>Pages</h2>
            <ul className={styles.links}>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h2 className={styles.colTitle}>Services</h2>
            <ul className={styles.links}>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={serviceHref(s.slug)}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h2 className={styles.colTitle}>Contact</h2>
            <ul className={styles.contactList}>
              {contacts.map((c) => (
                <li key={c.tel}>
                  <a href={`tel:${c.tel}`} className={styles.contact}>
                    <Phone aria-hidden="true" />
                    <span>
                      <span className={styles.phone}>{c.phone}</span>
                      <span className={styles.person}>{c.name}</span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${company.email}`} className={styles.contact}>
                  <Mail aria-hidden="true" />
                  <span className={styles.phone}>{company.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.address}>
          <MapPin aria-hidden="true" />
          <address>{company.address}</address>
          <a href={mapDirections} target="_blank" rel="noopener noreferrer" className="s-btn s-btn--link">
            <span>Get directions</span>
            <ArrowUpRight className="s-btn__arrow" aria-hidden="true" />
          </a>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 PS Laser. All rights reserved.</span>
          <span>GSTIN {company.gstin}</span>
        </div>
      </div>
    </footer>
  );
}
