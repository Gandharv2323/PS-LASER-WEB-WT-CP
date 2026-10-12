import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/sites/kakadelaser/page-banner";
import { blogPosts, getPost, readingTime, type BlogBlock } from "@/components/sites/pslaser-pages/content";
import { CtaBand, WaButton } from "@/components/sites/pslaser-pages/ui";
import "@/components/sites/pslaser-pages/pages.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      images: [{ url: post.image }],
    },
  };
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "p":
      return <p>{block.text}</p>;
    case "ul":
      return (
        <ul>
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <table>
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.join("|")}>
                {r.map((c, i) =>
                  i === 0 ? (
                    <th key={c} scope="row">
                      {c}
                    </th>
                  ) : (
                    <td key={c}>{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "note":
      return <p className="psp-article-note">{block.text}</p>;
  }
}

export default async function BlogArticlePage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const others = blogPosts.filter((p) => p.slug !== post.slug);

  return (
    <>
      <PageBanner
        title={post.title}
        image={post.image}
        breadcrumb={[{ label: "Blogs", href: "/blogs" }, { label: post.tag }]}
      />

      <div className="psp">
        <section className="psp-section" aria-label="Article">
          <div className="container">
            <div className="psp-article-wrap">
              <article className="psp-article">
                <div className="psp-article-meta">
                  <span>
                    <i className="bx bx-purchase-tag" aria-hidden="true" /> {post.tag}
                  </span>
                  <span>
                    <i className="bx bx-time-five" aria-hidden="true" /> {readingTime(post)}
                  </span>
                </div>
                <figure className="psp-article-hero">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.imageAlt} />
                  <figcaption className="psp-figure-note">Representative image</figcaption>
                </figure>
                <p className="psp-lead">{post.excerpt}</p>
                {post.body.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
                <div className="psp-actions">
                  <WaButton message={post.quoteMessage}>Ask us on WhatsApp</WaButton>
                  <Link href={post.related.href} className="psp-btn psp-btn-outline">
                    <span>{post.related.label}</span>
                    <i className="bx bx-right-arrow-alt" aria-hidden="true" />
                  </Link>
                </div>
                <Link href="/blogs" className="psp-back psp-textlink">
                  <i className="bx bx-left-arrow-alt" aria-hidden="true" /> All guides
                </Link>
              </article>

              <aside className="psp-aside" aria-label="More from PS Laser">
                <div className="psp-aside-box is-dark">
                  <h2>Get a quote</h2>
                  <p>Send your drawing with the material, thickness and quantity. We reply on WhatsApp.</p>
                  <WaButton message={post.quoteMessage}>WhatsApp us</WaButton>
                </div>
                <div className="psp-aside-box">
                  <h2>More guides</h2>
                  <ul className="psp-aside-links">
                    {others.map((o) => (
                      <li key={o.slug}>
                        <Link href={`/blogs/${o.slug}`}>{o.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="psp-aside-box">
                  <h2>Services</h2>
                  <ul className="psp-aside-links">
                    <li>
                      <Link href="/engineering-services#laser-cutting">CNC Laser Cutting</Link>
                    </li>
                    <li>
                      <Link href="/engineering-services#cnc-bending">CNC Bending</Link>
                    </li>
                    <li>
                      <Link href="/engineering-services#powder-coating">Powder Coating</Link>
                    </li>
                    <li>
                      <Link href="/pattern-design">Pattern Design</Link>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <CtaBand
          title="Ready to make your part?"
          text="From DXF to coated, inspected parts, all in one shop at Velu, Pune."
          message={post.quoteMessage}
        />
      </div>
    </>
  );
}
