"use client";

import { memo, useMemo, useState, useTransition } from "react";
import { VirtualList } from "@/components/advanced/virtual-list";
import { formatINR, nestPerSheet } from "@/lib/api/estimate";

interface Part {
  readonly no: number;
  readonly label: string;
  readonly sheet: number;
  readonly slot: string;
  readonly cumulative: number;
}

const MAX_PARTS = 10_000;

/** React.memo row: scrolling re-renders the list, but unchanged rows are skipped. */
const PartRow = memo(function PartRow({ part }: { part: Part }) {
  return (
    <div className="ps-adv-prow">
      <span className="ps-adv-prow-no">{part.label}</span>
      <span>Sheet {part.sheet}</span>
      <span className="d-none d-sm-inline">{part.slot}</span>
      <span className="ps-adv-prow-cost">{formatINR(part.cumulative)}</span>
    </div>
  );
});

/**
 * Generated production list (one row per part, up to 10 000). Two performance tools:
 *  - list virtualisation (<VirtualList>) — only visible rows are in the DOM;
 *  - useTransition — the filter input stays responsive while the (potentially 10k-item)
 *    filter runs as a low-priority render; `isPending` dims the stale list.
 */
export function PartsList({ quantity, perPart, lengthMm, widthMm }: { quantity: number; perPart: number; lengthMm: number; widthMm: number }) {
  const [text, setText] = useState(""); // urgent: what the user typed
  const [query, setQuery] = useState(""); // deferred: what the list is filtered by
  const [isPending, startTransition] = useTransition();

  const parts = useMemo<Part[]>(() => {
    const { perSheet, cols } = nestPerSheet(lengthMm, widthMm);
    const n = Math.min(Math.max(0, Math.floor(quantity)), MAX_PARTS);
    return Array.from({ length: n }, (_, i) => {
      const inSheet = perSheet > 0 ? i % perSheet : 0;
      return {
        no: i + 1,
        label: `P-${String(i + 1).padStart(5, "0")}`,
        sheet: perSheet > 0 ? Math.floor(i / perSheet) + 1 : 0,
        slot: perSheet > 0 ? `Row ${Math.floor(inSheet / Math.max(cols, 1)) + 1}, Col ${(inSheet % Math.max(cols, 1)) + 1}` : "—",
        cumulative: Math.round(perPart * (i + 1) * 100) / 100,
      };
    });
  }, [quantity, perPart, lengthMm, widthMm]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parts;
    const sheetMatch = /^s(?:heet)?\s*(\d+)$/.exec(q);
    return parts.filter((p) => (sheetMatch ? p.sheet === Number(sheetMatch[1]) : p.label.toLowerCase().includes(q)));
  }, [parts, query]);

  return (
    <div className="ps-adv-parts">
      <div className="ps-adv-parts-head">
        <label htmlFor="parts-filter" className="mb-0">
          Filter parts <span className="ps-optional">(e.g. P-00042 or sheet 2)</span>
        </label>
        <input
          id="parts-filter"
          className="form-control form-control-sm"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            startTransition(() => setQuery(e.target.value));
          }}
          placeholder="P-00042 / sheet 2"
        />
        <span className="ps-adv-muted" aria-live="polite">
          {isPending ? "Filtering…" : `${filtered.length.toLocaleString("en-IN")} of ${parts.length.toLocaleString("en-IN")} parts`}
          {quantity > MAX_PARTS ? ` (first ${MAX_PARTS.toLocaleString("en-IN")} shown)` : ""}
        </span>
      </div>
      <div className="ps-adv-prow ps-adv-prow--head" aria-hidden="true">
        <span>Part</span>
        <span>Sheet</span>
        <span className="d-none d-sm-inline">Position</span>
        <span className="ps-adv-prow-cost">Running total</span>
      </div>
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {filtered.length === 0 ? (
          <p className="ps-adv-muted p-3 mb-0">No parts match.</p>
        ) : (
          <VirtualList
            items={filtered}
            rowHeight={36}
            height={288}
            label="Generated parts list"
            getKey={(p) => p.no}
            renderRow={(p) => <PartRow part={p} />}
          />
        )}
      </div>
    </div>
  );
}
