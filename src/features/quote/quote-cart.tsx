"use client";

import Link from "next/link";
import { formatINR } from "@/lib/api/estimate";
import { whatsapp } from "@/lib/pslaser/data";
import { selectCartTotal, selectCount, useQuoteStore, useQuoteStoreHydrated, type CartItem } from "@/store/quote-store";

function cartMessage(items: readonly CartItem[]): string {
  return [
    "Hi PS Laser, please quote these parts (indicative estimates from your website, sample rates):",
    ...items.map((i, n) => `${n + 1}. ${i.label} — qty ${i.input.quantity}, est. ${formatINR(i.estimate.total)}`),
    "I can share the DXF/drawings.",
  ].join("\n");
}

/** Saved estimates (Zustand + persist). Each selector subscribes to just its slice. */
export function QuoteCart({ compact = false }: { compact?: boolean }) {
  const hydrated = useQuoteStoreHydrated();
  const items = useQuoteStore((s) => s.items);
  const count = useQuoteStore(selectCount);
  const total = useQuoteStore(selectCartTotal);
  const remove = useQuoteStore((s) => s.remove);
  const clear = useQuoteStore((s) => s.clear);

  if (!hydrated) return <p className="ps-adv-muted">Loading saved estimates…</p>;

  if (compact) {
    return count === 0 ? null : (
      <p className="ps-adv-note">
        <i className="bx bx-cart" aria-hidden="true" /> You have <strong>{count}</strong> saved estimate{count === 1 ? "" : "s"} ({formatINR(total)} indicative).{" "}
        <Link href="/quote#cart">Review them</Link>
      </p>
    );
  }

  return (
    <div className="ps-adv-cart">
      {count === 0 ? (
        <p className="ps-adv-muted mb-0">No saved estimates yet. Use “Save estimate” above — they stay in this browser across pages.</p>
      ) : (
        <>
          <ul className="list-unstyled mb-3">
            {items.map((i) => (
              <li key={i.id} className="ps-adv-cart-item">
                <div>
                  <strong>{i.label}</strong>
                  <div className="ps-adv-muted small">
                    Qty {i.input.quantity} · {i.source === "spring" ? "live" : "offline"} estimate
                  </div>
                </div>
                <span className="ps-adv-cart-price">{formatINR(i.estimate.total)}</span>
                <button type="button" className="ps-adv-icon-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.label}`}>
                  <i className="bx bx-trash" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="ps-adv-cart-foot">
            <span>
              {count} item{count === 1 ? "" : "s"} · <strong>{formatINR(total)}</strong> indicative
            </span>
            <span className="ps-adv-cart-actions">
              <button type="button" className="btn ps-btn-outline btn-sm" onClick={clear}>
                Clear
              </button>
              <a href={whatsapp(cartMessage(items))} target="_blank" rel="noopener noreferrer" className="btn ps-wa-btn btn-sm">
                <i className="bx bxl-whatsapp" aria-hidden="true" /> Send all on WhatsApp
              </a>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
