import "bootstrap/dist/css/bootstrap.min.css";
import "boxicons/css/boxicons.min.css";
import "aos/dist/aos.css";
import "owl.carousel/dist/assets/owl.carousel.min.css";
import "./kakadelaser.css";

import type { Metadata } from "next";
import { AosInit } from "@/components/sites/kakadelaser/aos-init";
import { SiteFooter } from "@/components/sites/kakadelaser/site-footer";
import { FloatingButtons, SiteHeader } from "@/components/sites/kakadelaser/site-header";

export const metadata: Metadata = {
  openGraph: { siteName: "PS Laser", type: "website", locale: "en_IN" },
};

/**
 * Classic PS Laser site (Bootstrap 4 + kakadelaser.css, orange). Supplies header, footer,
 * floating WhatsApp, back-to-top and AOS for every page in this group. Pages render only
 * their main content (starting with <PageBanner/>). Everything sits inside .ps-home so the
 * orange scoped rules apply. Contract: docs/research/pslaser/classic-pages.md
 */
export default function ClassicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="ps-home">
      {/* React 19 hoists this stylesheet into <head>. kakadelaser.css expects "Roboto" by name. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
        precedence="default"
      />
      <AosInit />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingButtons />
    </div>
  );
}
