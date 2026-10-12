"use client";

import { useCallback, useMemo, useState } from "react";
import { whatsapp } from "@/lib/pslaser/data";
import { Lightbox, type LightboxSlide } from "./lightbox";
import { PatternSvg, patternSeries, patterns, type PatternSeries } from "./patterns";

type SeriesKey = "all" | PatternSeries;

const SERIES_LABEL: Record<PatternSeries, string> = {
  geometric: "Geometric",
  floral: "Floral-inspired",
  linear: "Linear",
};

const patternMessage = (code: string, name: string) =>
  `Hi PS Laser, I'm interested in jaali pattern ${code} (${name}). Panel size: ___ x ___ mm, Material & thickness: ___, Quantity: ___, Finish/colour: ___.`;

function EnquireLink({ code, name }: { code: string; name: string }) {
  return (
    <a
      href={whatsapp(patternMessage(code, name))}
      target="_blank"
      rel="noopener noreferrer"
      className="psp-btn psp-btn-solid psp-btn-sm"
    >
      <i className="bx bxl-whatsapp" aria-hidden="true" />
      <span>Enquire on WhatsApp</span>
    </a>
  );
}

export function PatternCatalogue() {
  const [series, setSeries] = useState<SeriesKey>("all");
  const [index, setIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (series === "all" ? patterns : patterns.filter((p) => p.series === series)),
    [series],
  );

  const slides: LightboxSlide[] = useMemo(
    () =>
      visible.map((p) => ({
        key: p.code,
        title: `${p.code} · ${p.name}`,
        caption: `${SERIES_LABEL[p.series]} · Design concept. ${p.note}`,
        content: (
          <div className="psp-lb-pattern">
            <PatternSvg pattern={p} uid={`lb-${p.code}`} />
          </div>
        ),
        action: <EnquireLink code={p.code} name={p.name} />,
      })),
    [visible],
  );

  const close = useCallback(() => setIndex(null), []);

  return (
    <>
      <div className="psp-filters" role="group" aria-label="Filter patterns by series" data-aos="fade-up">
        {patternSeries.map((s) => (
          <button
            key={s.key}
            type="button"
            className={series === s.key ? "is-active" : undefined}
            aria-pressed={series === s.key}
            onClick={() => setSeries(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="psp-sr-only" aria-live="polite">
        Showing {visible.length} patterns
      </p>

      <ul className="psp-patterns" key={series}>
        {visible.map((p, i) => (
          <li key={p.code} className="psp-pattern-card" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
            <button type="button" className="psp-pattern-view" onClick={() => setIndex(i)} aria-label={`Enlarge ${p.code} ${p.name}`}>
              <PatternSvg pattern={p} uid={`card-${p.code}`} title={false} />
              <span className="psp-gallery-zoom" aria-hidden="true">
                <i className="bx bx-zoom-in" />
              </span>
            </button>
            <div className="psp-pattern-meta">
              <p className="psp-pattern-code">{p.code}</p>
              <h3>{p.name}</h3>
              <p className="psp-pattern-series">{SERIES_LABEL[p.series]}</p>
              <EnquireLink code={p.code} name={p.name} />
            </div>
          </li>
        ))}
      </ul>

      <Lightbox slides={slides} index={index} onClose={close} onIndexChange={setIndex} label="Pattern" />
    </>
  );
}
