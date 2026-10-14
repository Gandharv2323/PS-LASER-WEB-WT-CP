"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";

type LoginState = { error: string | null };

/**
 * Staff login. useActionState drives the async submit + pending state; the route handler
 * sets the httpOnly cookie, then router.refresh() re-renders the Server Component page,
 * whose withAuth() now finds a valid session.
 */
export function LoginForm({ reason }: { reason: "anonymous" | "forbidden" }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<LoginState, FormData>(async (_prev, fd) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    }).catch(() => null);
    if (!res) return { error: "Network error. Is the dev server running?" };
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => null);
      const message = typeof body === "object" && body && "message" in body && typeof body.message === "string" ? body.message : `Login failed (${res.status})`;
      return { error: message };
    }
    router.refresh();
    return { error: null };
  }, { error: reason === "forbidden" ? "Your account is not a staff account." : null });

  return (
    <form action={action} className="ps-adv-card ps-adv-login" noValidate>
      <h4>Staff login</h4>
      <p className="ps-adv-muted">The production dashboard is for PS Laser staff. Sign in with your back-office account.</p>
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" autoComplete="username" className="form-control" required />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" autoComplete="current-password" className="form-control" required />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <div role="alert" aria-live="assertive">
        {state.error ? <div className="alert alert-warning mt-3 mb-0">{state.error}</div> : null}
      </div>
      <p className="ps-adv-muted small mt-3 mb-0">
        <i className="bx bx-lock-alt" aria-hidden="true" /> Your session token is kept in an httpOnly cookie, never in browser storage.
      </p>
    </form>
  );
}
