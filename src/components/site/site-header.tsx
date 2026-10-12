"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GENERAL_QUOTE_MESSAGE, company, contacts, services, whatsapp } from "@/lib/pslaser/data";
import { isActive, mainNav, routes, serviceHref } from "@/lib/site/nav";
import { WhatsAppIcon } from "./icons";
import { Logo } from "./logo";
import { useScrollLock } from "./use-scroll-lock";
import styles from "./site-header.module.css";

const engineeringItems = services.filter((s) => s.slug !== "architectural");

/**
 * Fixed site header. Transparent (light text) over the dark hero every page starts
 * with; turns solid paper once the page scrolls or the mobile menu opens.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu when the route changes (state-during-render pattern, no effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Escape to close, Tab focus trap inside the open menu, close if resized to desktop.
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current || !toggleRef.current) return;
      const focusables = [
        toggleRef.current,
        ...Array.from(panelRef.current.querySelectorAll<HTMLElement>("a[href], button")),
      ];
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1180px)");
    const onMq = () => mq.matches && close(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  const solid = scrolled || open;

  return (
    <header
      className={styles.header}
      data-solid={solid}
      data-open={open}
      data-logo-tone={solid ? "dark" : "light"}
    >
      <div className={`s-container ${styles.bar}`}>
        <Link href={routes.home} className={styles.brand} aria-label="PS Laser — home">
          <Logo adaptive priority />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              const hasMenu = item.href === routes.engineering;
              return (
                <li key={item.href} className={hasMenu ? styles.hasMenu : undefined}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                    {hasMenu && <ChevronDown className={styles.chev} aria-hidden="true" />}
                  </Link>
                  {hasMenu && (
                    <div className={styles.dropdown}>
                      <ul>
                        {engineeringItems.map((s) => (
                          <li key={s.slug}>
                            <Link href={serviceHref(s.slug)} className={styles.dropLink}>
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a
            href={whatsapp(GENERAL_QUOTE_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className={`s-btn s-btn--sm ${styles.cta}`}
          >
            <WhatsAppIcon />
            <span>Get Quote</span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.toggleBars} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        ref={panelRef}
        className={styles.panel}
        data-open={open}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className={`s-container ${styles.panelInner}`}>
          <ul className={styles.panelList}>
            {mainNav.map((item, i) => (
              <li key={item.href} style={{ transitionDelay: open ? `${80 + i * 35}ms` : "0ms" }}>
                <Link
                  href={item.href}
                  className={styles.panelLink}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  onClick={() => close(false)}
                >
                  <span className={styles.panelIndex}>{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.panelFoot}>
            <a
              href={whatsapp(GENERAL_QUOTE_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="s-btn s-btn--lg s-btn--block"
            >
              <WhatsAppIcon />
              <span>Get a quote on WhatsApp</span>
            </a>
            <div className={styles.panelContacts}>
              <a href={`tel:${contacts[0].tel}`}>{contacts[0].phone}</a>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
