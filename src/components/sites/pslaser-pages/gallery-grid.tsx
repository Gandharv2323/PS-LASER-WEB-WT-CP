"use client";

import { useCallback, useMemo, useState } from "react";
import { galleryFilters, galleryItems, type GalleryCategory } from "./content";
import { Lightbox, type LightboxSlide } from "./lightbox";

type FilterKey = "all" | GalleryCategory;

const CATEGORY_LABEL: Record<GalleryCategory, string> = {
  products: "Products",
  machines: "Machines",
  facility: "Facility",
  quality: "Quality",
};

export function GalleryGrid() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [index, setIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? galleryItems : galleryItems.filter((g) => g.category === filter)),
    [filter],
  );

  const slides: LightboxSlide[] = useMemo(
    () =>
      visible.map((g) => ({
        key: g.id,
        title: g.title,
        caption: `${CATEGORY_LABEL[g.category]} · ${g.caption}`,
        // eslint-disable-next-line @next/next/no-img-element
        content: <img src={g.src} alt={g.title} />,
      })),
    [visible],
  );

  const close = useCallback(() => setIndex(null), []);

  return (
    <>
      <div className="psp-filters" role="group" aria-label="Filter gallery" data-aos="fade-up">
        {galleryFilters.map((f) => {
          const n = f.key === "all" ? galleryItems.length : galleryItems.filter((g) => g.category === f.key).length;
          return (
            <button
              key={f.key}
              type="button"
              className={filter === f.key ? "is-active" : undefined}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="psp-filter-count">{n}</span>
            </button>
          );
        })}
      </div>
      <p className="psp-sr-only" aria-live="polite">
        Showing {visible.length} images
      </p>

      <ul className="psp-gallery" key={filter}>
        {visible.map((g, i) => (
          <li key={g.id} className="psp-gallery-item" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`Enlarge: ${g.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.title} loading="lazy" decoding="async" />
              <span className="psp-gallery-zoom" aria-hidden="true">
                <i className="bx bx-zoom-in" />
              </span>
            </button>
            <div className="psp-gallery-info">
              <h3>{g.title}</h3>
              <p>
                <span className={`psp-tag psp-tag-${g.category}`}>{CATEGORY_LABEL[g.category]}</span> {g.caption}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Lightbox slides={slides} index={index} onClose={close} onIndexChange={setIndex} label="Gallery" />
    </>
  );
}
