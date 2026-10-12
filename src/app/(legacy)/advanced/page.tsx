import type { Metadata } from "next";
import { AdvancedHome } from "@/components/sites/pslaser-advanced/advanced-home";

export const metadata: Metadata = {
  title: { absolute: "PS Laser | Precision Engineering & Sheet Metal Manufacturing in Pune" },
  description:
    "PS Laser — manufacturer of precision engineering and sheet metal components. CNC fiber laser cutting, CNC bending, Amada turret punching, laser welding, fabrication and powder coating at Velu, Pune, Maharashtra.",
  icons: { icon: "/sites/pslaser/logo/favicon.png" },
};

export default function AdvancedPage() {
  return <AdvancedHome />;
}
