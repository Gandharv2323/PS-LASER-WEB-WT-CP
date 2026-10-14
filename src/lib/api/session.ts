/**
 * Server-only session helpers. The Spring JWT lives in an httpOnly cookie (never in
 * localStorage, so injected scripts cannot read it). We verify its HS256 signature with
 * the shared JWT_SECRET (CONTRACT "Auth") before trusting any claim.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE, JWT_SECRET } from "./config";
import type { JwtClaims, Role, Session } from "./types";
import { isObject } from "./validate";

const b64urlJson = (part: string): unknown => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

/** Type guard: narrows `unknown` to JwtClaims. */
function isClaims(v: unknown): v is JwtClaims {
  return (
    isObject(v) &&
    typeof v.email === "string" &&
    typeof v.exp === "number" &&
    (v.role === "admin" || v.role === "staff" || v.role === "customer")
  );
}

export function verifyJwt(token: string, secret = JWT_SECRET): JwtClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  try {
    const h = b64urlJson(header);
    if (!isObject(h) || h.alg !== "HS256") return null;
    const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest();
    const given = Buffer.from(signature, "base64url");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const claims = b64urlJson(payload);
    if (!isClaims(claims) || claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const c = verifyJwt(token);
  return c ? { email: c.email, role: c.role, name: c.name ?? c.email, expiresAt: c.exp * 1000 } : null;
}

export async function getToken(): Promise<string | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return token && verifyJwt(token) ? token : null;
}

export const STAFF_ROLES: readonly Role[] = ["admin", "staff"];
