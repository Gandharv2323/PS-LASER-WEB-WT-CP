"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Own list virtualisation (windowing): only rows inside the viewport (+ overscan) are
 * mounted, so a 10 000-row parts list renders ~25 DOM rows. Fixed row height keeps the
 * maths O(1): first = floor(scrollTop / rowHeight).
 * Generic over the item type; rows come from a render prop.
 */
export function VirtualList<T>({
  items,
  rowHeight,
  height,
  overscan = 6,
  renderRow,
  getKey,
  label,
}: {
  items: readonly T[];
  rowHeight: number;
  height: number;
  overscan?: number;
  renderRow: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string | number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState(height);

  // Measure the real viewport size before paint so the first frame shows the right rows.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setViewport(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const last = Math.min(items.length, Math.ceil((scrollTop + viewport) / rowHeight) + overscan);
  const visible = items.slice(first, last);

  return (
    <div
      ref={ref}
      className="ps-adv-vlist"
      style={{ height }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      role="list"
      aria-label={label}
      tabIndex={0}
    >
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${first * rowHeight}px)` }}>
          {visible.map((item, i) => (
            <div key={getKey(item, first + i)} role="listitem" style={{ height: rowHeight }}>
              {renderRow(item, first + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
