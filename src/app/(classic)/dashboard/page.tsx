import "@/components/advanced/advanced.css";

import type { Metadata } from "next";
import { Panel } from "@/components/advanced/panel";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { DashboardBoard, LoginForm, withAuth, type WithSessionProps } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Staff Dashboard",
  description: "PS Laser production board for staff.",
  robots: { index: false, follow: false },
};

function DashboardContent({ session }: WithSessionProps) {
  return <DashboardBoard session={session} />;
}

/** HOC: renders the board only for a verified staff/admin JWT cookie, else the login form. */
const ProtectedDashboard = withAuth(DashboardContent, {
  fallback: (reason) => (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-5">
        <LoginForm reason={reason} />
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <>
      <PageBanner
        title="Staff Dashboard"
        subtitle="Live production board for PS Laser work orders."
        image="/sites/pslaser/gallery/fabrication-welding-bg.jpg"
        breadcrumb={[{ label: "Staff Dashboard" }]}
      />
      {/* Polymorphic Panel rendered as a <section>. */}
      <Panel as="section" className="services ps-adv-section" aria-label="Dashboard">
        <div className="container">
          <ProtectedDashboard />
        </div>
      </Panel>
    </>
  );
}
