import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { RevealObserver } from "@/components/site/reveal-observer";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import "./site.css";

// UI/body face (variable) + condensed industrial display face.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  openGraph: {
    siteName: "PS Laser",
    type: "website",
    locale: "en_IN",
  },
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`s-root ${manrope.variable} ${barlow.variable}`}>
      <a href="#main" className="s-skip">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingWhatsApp />
      <RevealObserver />
    </div>
  );
}
