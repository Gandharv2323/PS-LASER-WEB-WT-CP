import Link from "next/link";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  mapDirections,
  mapShare,
  services,
  whatsapp,
} from "@/lib/pslaser/data";
import { mainNav, routes } from "@/lib/site/nav";

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

const half = Math.ceil(mainNav.length / 2);
/** Online tools (Unit V pages) listed after the main nav. */
const TOOL_LINKS = [
  { href: "/quote", label: "Instant Estimate" },
  { href: "/track", label: "Track Order" },
];
const NAV_COLUMNS = [mainNav.slice(0, half), [...mainNav.slice(half), ...TOOL_LINKS]];

export function SiteFooter() {
  return (
    <footer id="footer">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-6 footer-contact ps-footer-brand">
              <Link href={routes.home} aria-label="PS Laser home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={company.logo} alt="PS Laser logo" loading="lazy" />
              </Link>
              <p>
                <strong>{company.brand}</strong>
                <br />
                {company.address}
              </p>
              <p className="ps-gstin">GSTIN: {company.gstin}</p>
              <div className="ps-footer-map">
                <a href={mapShare} {...EXT}>
                  <i className="bx bx-map" aria-hidden="true" /> View on Google Maps
                </a>
                <a href={mapDirections} {...EXT}>
                  <i className="bx bx-directions" aria-hidden="true" /> Get directions
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 footer-links">
              <h4>Explore</h4>
              <ul>
                {NAV_COLUMNS.map((col, i) => (
                  <div className="division col-6" key={i}>
                    {col.map((l) => (
                      <li key={l.href}>
                        <i className="bx bx-chevron-right" aria-hidden="true" />{" "}
                        <Link href={l.href}>{l.label}</Link>
                      </li>
                    ))}
                  </div>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 footer-links">
              <h4>Services</h4>
              <ul className="ps-footer-services">
                <div className="division col-12">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <i className="bx bx-chevron-right" aria-hidden="true" />{" "}
                      <Link href={`${routes.engineering}#${s.slug}`}>{s.title}</Link>
                    </li>
                  ))}
                </div>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 footer-links ps-footer-contact">
              <h4>Contact Us</h4>
              <ul>
                <div className="division col-12">
                  {contacts.map((c) => (
                    <li key={c.tel}>
                      <i className="bx bx-phone" aria-hidden="true" />{" "}
                      <a href={`tel:${c.tel}`}>
                        {c.phone} <span>({c.name})</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <i className="bx bx-envelope" aria-hidden="true" />{" "}
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </li>
                </div>
              </ul>
              <a href={whatsapp(GENERAL_QUOTE_MESSAGE)} {...EXT} className="btn ps-wa-btn">
                <i className="bx bxl-whatsapp" aria-hidden="true" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="copyright-footer" className="container">
        <div className="copyright">
          <span>© {new Date().getFullYear()} {company.brand}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
