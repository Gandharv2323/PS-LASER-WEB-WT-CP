"use client";

import Image from "next/image";
import { memo, useDeferredValue, useMemo, useState, useTransition } from "react";
import { machines, whatsapp, type Machine } from "@/lib/pslaser/data";

const CATEGORIES = ["All", ...Array.from(new Set(machines.map((m) => m.category)))] as const;

/** Memoised card: typing in the search box doesn't re-render cards whose props are equal. */
const MachineCard = memo(function MachineCard({ m }: { m: Machine }) {
  return (
    <li className="col-sm-6 col-lg-4 mb-4 d-flex">
      <article className="ps-adv-mcard">
        <div className="ps-adv-mcard-img">
          {/* next/image: responsive srcset from `sizes`, lazy by default, no layout shift (fill + aspect box). */}
          <Image src={m.image} alt={m.name} fill sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw" />
        </div>
        <div className="ps-adv-mcard-body">
          <span className="ps-adv-chip">{m.category}</span>
          <h5>{m.shortName}</h5>
          <ul className="ps-adv-specs">
            {m.specs.slice(0, 3).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <a href={whatsapp(m.quoteMessage)} target="_blank" rel="noopener noreferrer" className="btn ps-wa-btn btn-sm">
            <i className="bx bxl-whatsapp" aria-hidden="true" /> Ask on WhatsApp
          </a>
        </div>
      </article>
    </li>
  );
});

/**
 * useDeferredValue for the search text (React renders the list with the old query first,
 * then re-renders in the background) and useTransition for the category chips.
 */
export function MachineFinder() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [isPending, startTransition] = useTransition();
  const stale = search !== deferredSearch || isPending;

  const visible = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return machines.filter(
      (m) =>
        (category === "All" || m.category === category) &&
        (!q || `${m.name} ${m.category} ${m.specs.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [deferredSearch, category]);

  return (
    <div>
      <div className="ps-adv-filter">
        <label htmlFor="machine-search" className="sr-only">
          Search machines
        </label>
        <input
          id="machine-search"
          type="search"
          className="form-control"
          placeholder="Search machines (e.g. 16 mm, stainless, punch)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ps-adv-chips" role="group" aria-label="Filter by process">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ps-adv-chip-btn${c === category ? " is-active" : ""}`}
              aria-pressed={c === category}
              onClick={() => startTransition(() => setCategory(c))}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <ul className="row list-unstyled mb-0" style={{ opacity: stale ? 0.65 : 1 }} aria-busy={stale}>
        {visible.map((m) => (
          <MachineCard key={m.slug} m={m} />
        ))}
        {visible.length === 0 ? <li className="col-12 ps-adv-muted">No machine matches “{deferredSearch}”.</li> : null}
      </ul>
    </div>
  );
}
