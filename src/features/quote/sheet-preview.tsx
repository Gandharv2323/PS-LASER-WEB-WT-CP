"use client";

import { useEffect, useRef, useState } from "react";
import { BED, nestPerSheet } from "@/lib/api/estimate";

/**
 * Canvas nesting preview of one 3000 x 1500 mm sheet. Deliberately loaded with
 * next/dynamic({ ssr: false }) from the calculator: canvas code is browser-only and not
 * needed for first paint, so it ships in its own chunk after hydration.
 */
export default function SheetPreview({ lengthMm, widthMm, quantity }: { lengthMm: number; widthMm: number; quantity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const nest = nestPerSheet(lengthMm, widthMm);
  const sheets = nest.perSheet > 0 ? Math.ceil(quantity / nest.perSheet) : 0;
  const onFirstSheet = Math.min(quantity, nest.perSheet);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const height = Math.round(width / 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = width / BED.lengthMm;
    ctx.fillStyle = "#e9ecef";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#1d1d1b";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    const pl = (nest.rotated ? widthMm : lengthMm) * s;
    const pw = (nest.rotated ? lengthMm : widthMm) * s;
    const gap = 5 * s;
    let drawn = 0;
    for (let r = 0; r < nest.rows && drawn < onFirstSheet; r++) {
      for (let c = 0; c < nest.cols && drawn < onFirstSheet; c++) {
        const x = c * (pl + gap);
        const y = r * (pw + gap);
        ctx.fillStyle = "rgba(239,125,0,0.85)";
        ctx.fillRect(x, y, pl, pw);
        ctx.strokeStyle = "#d96f00";
        ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, pl - 1), Math.max(0, pw - 1));
        drawn++;
      }
    }
  }, [width, lengthMm, widthMm, nest.rows, nest.cols, nest.rotated, onFirstSheet]);

  return (
    <figure className="ps-adv-sheet" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={`Sheet 1 of ${sheets}: ${onFirstSheet} parts nested on a 3000 by 1500 mm sheet`} />
      <figcaption className="ps-adv-muted">
        {nest.perSheet > 0 ? (
          <>
            Simple grid nest: <strong>{nest.perSheet}</strong> parts per 3 m × 1.5 m sheet
            {nest.rotated ? " (rotated 90°)" : ""}, about <strong>{sheets}</strong> sheet{sheets === 1 ? "" : "s"} for {quantity} parts.
            Real nesting is done in CAM and is usually tighter.
          </>
        ) : (
          "Part is larger than the 3000 × 1500 mm laser bed."
        )}
      </figcaption>
    </figure>
  );
}
