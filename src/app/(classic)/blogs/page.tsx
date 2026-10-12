import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { blogPosts, readingTime } from "@/components/sites/pslaser-pages/content";
import { CtaBand, SectionTitle } from "@/components/sites/pslaser-pages/ui";
import "@/components/sites/pslaser-pages/pages.css";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Practical sheet metal guides from PS Laser, Pune: preparing DXF files for laser cutting, choosing material and thickness, and why pre-treatment matters in powder coating.",
};

export default function BlogsPage() {
  return (
    <>
      <PageBanner
        title="Blogs"
        subtitle="Practical guides to getting better laser-cut, bent and coated parts."
        image="/sites/pslaser/gallery/cnc-bending-bg.jpg"
        breadcrumb={[{ label: "Blogs" }]}
      />

      <div className="psp">
        <section className="psp-section psp-alt" aria-labelledby="blogs-title">
          <div className="container">
            <SectionTitle
              id="blogs-title"
              strong="Guides"
              light="& Know-how"
              lead="Short, practical reading for engineers, buyers and designers who send sheet metal work to a job shop."
            />
            <ul className="psp-blog-grid">
              {blogPosts.map((p, i) => (
                <li key={p.slug} data-aos="fade-up" data-aos-delay={String(i * 100)}>
                  <article className="psp-blog-card">
                    <div className="psp-blog-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" loading="lazy" decoding="async" />
                      <span className="psp-tag">{p.tag}</span>
                    </div>
                    <div className="psp-blog-body">
                      <p className="psp-blog-meta">
                        <i className="bx bx-time-five" aria-hidden="true" />
                        {readingTime(p)}
                      </p>
                      <h2>
                        <Link href={`/blogs/${p.slug}`}>{p.title}</Link>
                      </h2>
                      <p>{p.excerpt}</p>
                      <span className="psp-readmore" aria-hidden="true">
                        Read guide <i className="bx bx-right-arrow-alt" />
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CtaBand
          title="Have a question about your part?"
          text="Ask us on WhatsApp about material, thickness, bending or finish. We are happy to advise before you order."
          message="Hi PS Laser, I have a technical question about a sheet metal part: ___"
          button="Ask on WhatsApp"
        />
      </div>
    </>
  );
}
