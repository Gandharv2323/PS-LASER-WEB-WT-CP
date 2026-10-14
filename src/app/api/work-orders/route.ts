import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";
import { getToken } from "@/lib/api/session";
import { adminWorkOrders } from "@/lib/api/spring";

/**
 * Authenticated BFF: reads the httpOnly cookie server-side and calls Spring
 * GET /api/admin/work-orders with `Authorization: Bearer <jwt>`.
 */
export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ status: 401, error: "Unauthorized", message: "Please log in." }, { status: 401 });
  try {
    const orders = await adminWorkOrders(token);
    return NextResponse.json({ source: "spring", orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof ApiError && e.status ? e.status : 503;
    const message = e instanceof Error ? e.message : "Work orders unavailable";
    return NextResponse.json({ status, error: "Upstream error", message }, { status: status >= 500 || status === 404 ? 503 : status });
  }
}
