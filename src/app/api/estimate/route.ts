import { NextResponse } from "next/server";
import { estimateInputSchema } from "@/lib/api/schemas";
import { springEstimate } from "@/lib/api/spring";
import { safeParse } from "@/lib/api/validate";

/**
 * BFF proxy: browser -> Next.js -> Spring POST /api/quotes/estimate.
 * Validates the body, forwards it, and falls back to the TypeScript formula when Spring
 * is offline (response `source: "offline"`), so the UI always gets the same typed shape.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 400, error: "Bad Request", message: "Body must be JSON" }, { status: 400 });
  }
  const parsed = safeParse(estimateInputSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ status: 400, error: "Bad Request", message: parsed.error.message }, { status: 400 });
  }
  const outcome = await springEstimate(parsed.value, request.signal);
  if (!outcome.ok) {
    return NextResponse.json(
      { status: outcome.status, error: "Bad Request", message: outcome.message, fieldErrors: outcome.fieldErrors },
      { status: outcome.status },
    );
  }
  return NextResponse.json(outcome.envelope, { headers: { "Cache-Control": "no-store" } });
}
