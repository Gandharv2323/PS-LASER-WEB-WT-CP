"use client";

import { useMemo } from "react";
import { computeEstimate, formatINR, validateEstimate } from "@/lib/api/estimate";
import type { EstimateInput, Material } from "@/lib/api/types";

/**
 * SVG bar chart: the same part priced in every material (sample rates). Loaded with
 * React.lazy + <Suspense> from the calculator, so its code is split into a separate chunk.
 * useMemo: 5 full estimates per render are only recomputed when the input changes.
 */
export default function MaterialsChart({ input, materials }: { input: EstimateInput; materials: readonly Material[] }) {
  const rows = useMemo(
    () =>
      materials.map((m) => {
        const candidate = { ...input, materialCode: m.code, thicknessMm: Math.min(input.thicknessMm, m.maxThicknessMm) };
        const ok = validateEstimate(candidate).ok;
        return { m, thickness: candidate.thicknessMm, perPart: ok ? computeEstimate(candidate).perPart : null };
      }),
    [input, materials],
  );
  const max = Math.max(1, ...rows.map((r) => r.perPart ?? 0));
  const barH = 26;
  const labelW = 120;
  const W = 520;
  const H = rows.length * (barH + 10);

  return (
    <figure className="ps-adv-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Per-part price by material at sample rates" width="100%">
        {rows.map((r, i) => {
          const y = i * (barH + 10);
          const w = r.perPart ? ((W - labelW - 90) * r.perPart) / max : 0;
          const active = r.m.code === input.materialCode;
          return (
            <g key={r.m.code}>
              <text x={0} y={y + barH * 0.68} fontSize="13" fill="#1d1d1b">
                {r.m.name} {r.thickness} mm
              </text>
              <rect x={labelW} y={y} width={w} height={barH} rx={3} fill={active ? "#EF7D00" : "#f7c58f"} />
              <text x={labelW + w + 6} y={y + barH * 0.68} fontSize="13" fill="#1d1d1b">
                {r.perPart === null ? "n/a" : formatINR(r.perPart)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="ps-adv-muted">Same size, cut length, pierces and bends; thickness capped at each material&apos;s maximum. Sample rates.</figcaption>
    </figure>
  );
}
