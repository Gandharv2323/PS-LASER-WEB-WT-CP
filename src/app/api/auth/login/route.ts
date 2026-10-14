import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";
import { AUTH_COOKIE } from "@/lib/api/config";
import { verifyJwt } from "@/lib/api/session";
import { springLogin } from "@/lib/api/spring";
import { isObject } from "@/lib/api/validate";

/**
 * Login BFF: forwards credentials to Spring POST /api/auth/login and stores the returned
 * JWT in an httpOnly, SameSite=Lax cookie. The token never reaches browser JavaScript,
 * so XSS cannot steal it (unlike localStorage).
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isObject(body) || typeof body.email !== "string" || typeof body.password !== "string" || !body.email || !body.password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }
  try {
    const { token, user } = await springLogin({ email: body.email, password: body.password });
    if (user.role === "customer") return NextResponse.json({ message: "Staff or admin account required." }, { status: 403 });
    const claims = verifyJwt(token);
    const res = NextResponse.json({ user });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: claims ? Math.max(60, claims.exp - Math.floor(Date.now() / 1000)) : 8 * 3600,
    });
    return res;
  } catch (e) {
    if (e instanceof ApiError && e.kind === "http" && (e.status === 401 || e.status === 400 || e.status === 403)) {
      return NextResponse.json({ message: "Wrong email or password." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "The Spring Boot auth server (localhost:8081) is not reachable. Start services/spring-api and try again." },
      { status: 503 },
    );
  }
}
