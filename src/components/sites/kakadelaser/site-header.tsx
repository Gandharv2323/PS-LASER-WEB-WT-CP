"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GENERAL_QUOTE_MESSAGE, company, services, whatsapp } from "@/lib/pslaser/data";
import { isActive, mainNav, routes } from "@/lib/site/nav";

/** Engineering dropdown: every service deep-links into /engineering-services, plus the machine list on home. */
/** Online tools (Unit V pages): instant estimate + order tracking. */
const TOOL_ITEMS = [
  { label: "Estimate", href: "/quote" },
  { label: "Track", href: "/track" },
];

const ENGINEERING_ITEMS = [
  ...services.map((s) => ({ label: s.title, href: `${routes.engineering}#${s.slug}` })),
  { label: "All machines", href: "/#machines" },
];

function NavList({
  mobile,
  pathname,
  onNavigate,
}: {
  mobile: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  // Remember which page the dropdown was opened on so it closes itself after navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const li = useRef<HTMLLIElement>(null);

  // Bootstrap-style: close the open dropdown on any outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (li.current && !li.current.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const done = () => {
    setOpenOn(null);
    onNavigate();
  };

  return (
    <ul>
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href);
        if (item.href === routes.engineering) {
          return (
            <li
              key={item.href}
              ref={li}
              className={`ps-dd${active ? " active" : ""}${open ? " show" : ""}`}
            >
              <a
                className="nav-link dropdown-toggle"
                href={item.href}
                role="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenOn(open ? null : pathname);
                }}
              >
                {item.label}{" "}
              </a>
              <div className={`dropdown-menu${open ? " show" : ""}${mobile ? " ps-dd-mobile" : ""}`}>
                <Link className="dropdown-item" href={item.href} onClick={done}>
                  All engineering services
                </Link>
                <div className="dropdown-divider" />
                {ENGINEERING_ITEMS.map((l) => (
                  <Link key={l.href} className="dropdown-item" href={l.href} onClick={done}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </li>
          );
        }
        return (
          <li key={item.href} className={active ? "active" : undefined}>
            <Link href={item.href} onClick={done} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        );
      })}
      {TOOL_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className={active ? "active" : undefined}>
            <Link href={item.href} onClick={done} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        );
      })}
      <li className="ps-nav-cta">
        <a
          href={whatsapp(GENERAL_QUOTE_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          id="nav-btn"
          className="btn"
          onClick={done}
        >
          Get Quote
        </a>
      </li>
    </ul>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The mobile nav is "open on" a pathname, so any route change closes it without an effect.
  const [navOpenOn, setNavOpenOn] = useState<string | null>(null);
  const navOpen = navOpenOn === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-active", navOpen);
    return () => document.body.classList.remove("mobile-nav-active");
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpenOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const close = () => setNavOpenOn(null);

  return (
    <>
      <button
        type="button"
        className="mobile-nav-toggle d-xl-none"
        onClick={() => setNavOpenOn(navOpen ? null : pathname)}
        aria-label={navOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={navOpen}
        aria-controls="ps-mobile-nav"
      >
        <i className={navOpen ? "bx bx-x" : "bx bx-menu"} aria-hidden="true" />
      </button>

      <header id="header" className={`fixed-top${scrolled ? " header-scrolled" : ""}`}>
        <div id="header-container" className="container d-flex align-items-center">
          <Link href={routes.home} className="logo mr-auto ps-brand" aria-label="PS Laser home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logo} alt="PS Laser logo" />
            <span className="ps-brand-text">
              <strong>
                <em>PS</em> LASER
              </strong>
              <small>{company.locationLabel}</small>
            </span>
          </Link>
          <nav className="nav-menu d-none d-xl-block" aria-label="Main">
            <NavList mobile={false} pathname={pathname} onNavigate={close} />
          </nav>
        </div>
      </header>

      <nav id="ps-mobile-nav" className="mobile-nav d-xl-none" aria-label="Main (mobile)">
        <NavList mobile pathname={pathname} onNavigate={close} />
      </nav>
      <div
        className="mobile-nav-overly"
        style={{ display: navOpen ? "block" : "none" }}
        onClick={close}
        aria-hidden="true"
      />
    </>
  );
}

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href={whatsapp(GENERAL_QUOTE_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="ps-wa-float"
        aria-label="Chat with PS Laser on WhatsApp"
      >
        <i className="bx bxl-whatsapp" aria-hidden="true" />
      </a>
      <a
        href="#"
        className={`back-to-top${showTop ? " ps-show" : ""}`}
        aria-label="Back to top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <i className="bx bxs-chevron-up" aria-hidden="true" />
      </a>
    </>
  );
}
