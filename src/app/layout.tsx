import type { Metadata, Viewport } from "next";

/**
 * Minimal root layout. Styling lives in the route-group layouts:
 *  - src/app/(classic)/layout.tsx → main classic multi-page site at "/" (Bootstrap 4 + kakadelaser.css)
 *  - src/app/(site)/layout.tsx    → modern redesign at /modern (site.css, fonts, header/footer)
 *  - src/app/(legacy)/layout.tsx  → /advanced (Bootstrap-era CSS)
 */
export const metadata: Metadata = {
  title: {
    default: "PS Laser | Precision Sheet Metal & CNC Laser Cutting, Pune",
    template: "%s | PS Laser",
  },
  description:
    "PS Laser is a sheet metal job shop at Velu, Bhor, Pune: CNC fiber laser cutting, CNC bending, turret punching, laser welding, fabrication and powder coating.",
  applicationName: "PS Laser",
  icons: { icon: "/sites/pslaser/logo/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
