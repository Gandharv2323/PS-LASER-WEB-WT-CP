import type { Metadata } from "next";
import { EnquiryForm } from "@/components/sites/kakadelaser/enquiry-form";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import {
  GENERAL_QUOTE_MESSAGE,
  company,
  contacts,
  mapDirections,
  mapEmbed,
  mapShare,
  whatsapp,
} from "@/lib/pslaser/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact PS Laser at Gat No. 753, Velu, Tal. Bhor, Pune 412205. Call, email or WhatsApp us for laser cutting, bending, punching, welding and powder coating quotes.",
};

const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        subtitle="Call, email or WhatsApp us, or visit our workshop at Velu, Bhor, Pune."
        image="/sites/pslaser/gallery/cnc-bending-bg.jpg"
        breadcrumb={[{ label: "Contact Us" }]}
      />

      {/* Map + address (Kakade contact layout) */}
      <section id="map-location" className="about section-bg">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Get in touch <span>with us</span>
            </h3>
          </div>
          <div className="ps-map">
            <iframe
              src={mapEmbed}
              title="PS Laser location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href={mapShare} {...EXT} className="ps-map-open">
              <i className="bx bx-link-external" aria-hidden="true" /> Open in Maps
            </a>
          </div>
          <div className="ps-map-actions">
            <a href={mapDirections} {...EXT} className="btn btn-primary">
              <i className="bx bx-directions" aria-hidden="true" /> Get directions
            </a>
            <a href={mapShare} {...EXT} className="btn ps-btn-outline">
              <i className="bx bx-map" aria-hidden="true" /> View on Google Maps
            </a>
          </div>

          <div className="row ps-contact-cards">
            <div className="col-lg-4 col-md-6 mt-4 d-flex align-items-stretch" data-aos="fade-up">
              <div className="ps-ccard ps-ccard--address">
                <i className="bx bx-buildings" aria-hidden="true" />
                <h6>PS LASER</h6>
                <p>
                  Gat No. 753, At Post – Velu,
                  <br />
                  Tal. Bhor, Dist. Pune – 412205,
                  <br />
                  Maharashtra, India
                </p>
                <a href={mapDirections} {...EXT} className="ps-ccard-link">
                  Get directions <i className="bx bx-right-arrow-alt" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mt-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="80">
              <div className="ps-ccard">
                <i className="bx bx-envelope" aria-hidden="true" />
                <h6>EMAIL</h6>
                <p>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </p>
                <p className="ps-ccard-note">Send drawings (DXF, DWG, PDF, STEP) with your enquiry.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 mt-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="160">
              <div className="ps-ccard ps-ccard--wa">
                <i className="bx bxl-whatsapp" aria-hidden="true" />
                <h6>WHATSAPP</h6>
                <p>
                  <a href={whatsapp(GENERAL_QUOTE_MESSAGE)} {...EXT}>
                    {contacts[0].phone}
                  </a>
                </p>
                <a href={whatsapp(GENERAL_QUOTE_MESSAGE)} {...EXT} className="btn ps-wa-btn">
                  <i className="bx bxl-whatsapp" aria-hidden="true" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="row">
            {contacts.map((c, i) => (
              <div key={c.tel} className="col-lg-3 col-6 mt-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay={i * 60}>
                <a href={`tel:${c.tel}`} className="ps-ccard ps-person">
                  <i className="bx bx-phone-call" aria-hidden="true" />
                  <h6>{c.name}</h6>
                  <span>{c.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="contact ps-contact-form">
        <div className="container" data-aos="fade-up">
          <div className="section-title">
            <h3>
              Send an <span>Enquiry</span>
            </h3>
            <p className="ps-section-lead">
              Tell us what you need. Your message opens in WhatsApp, ready to send, and you can attach
              your drawing there.
            </p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
