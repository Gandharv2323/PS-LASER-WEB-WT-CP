// Contract test for the estimator (shared rounding rule). Usage: node scripts/test-estimate.mjs [baseUrl]
// Hits the Next.js BFF /api/estimate (Spring when up, otherwise the TS offline formula).
import assert from "node:assert/strict";

const base = process.argv[2] ?? "http://localhost:3001";
const post = (body) =>
  fetch(`${base}/api/estimate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const ref = { materialCode: "MS", thicknessMm: 2, lengthMm: 500, widthMm: 300, cutLengthMm: 1600, pierces: 4, bends: 2, powderCoat: true, quantity: 10 };
const res = await post(ref);
assert.equal(res.status, 200);
const { source, estimate } = await res.json();
assert.equal(estimate.perPart, 248.63);
assert.equal(estimate.subtotal, 2486.3);
assert.equal(estimate.gst, 447.53);
assert.equal(estimate.total, 2933.83);
assert.equal(estimate.isSample, true);
console.log(`ok reference case (${source}): total ${estimate.total}`);

const gap = await post({ ...ref, thicknessMm: 3.005 });
assert.equal(gap.status, 400);
const body = await gap.json();
assert.match(body.fieldErrors?.thicknessMm ?? body.message, /rate band/i);
console.log("ok 3.005 mm -> 400 no rate band");

const big = await post({ ...ref, lengthMm: 3500 });
assert.equal(big.status, 400);
console.log("ok oversize -> 400");
