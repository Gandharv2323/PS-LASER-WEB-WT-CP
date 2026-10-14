import type { ComponentType, ReactNode } from "react";
import { getSession, STAFF_ROLES } from "@/lib/api/session";
import type { Role, Session } from "@/lib/api/types";

/** Props the wrapped component receives in addition to its own. */
export type WithSessionProps = { session: Session };

/**
 * Higher-order component (server side). `withAuth(Page)` returns a new async Server
 * Component that verifies the httpOnly JWT cookie and only then renders `Page` with the
 * session injected; otherwise it renders `fallback` (the login form).
 * Generic over P so the wrapped component keeps its own prop types.
 */
export function withAuth<P extends object>(
  Wrapped: ComponentType<P & WithSessionProps>,
  { roles = STAFF_ROLES, fallback }: { roles?: readonly Role[]; fallback: (reason: "anonymous" | "forbidden") => ReactNode },
) {
  async function Authenticated(props: P) {
    const session = await getSession();
    if (!session) return <>{fallback("anonymous")}</>;
    if (!roles.includes(session.role)) return <>{fallback("forbidden")}</>;
    return <Wrapped {...props} session={session} />;
  }
  Authenticated.displayName = `withAuth(${Wrapped.displayName ?? Wrapped.name ?? "Component"})`;
  return Authenticated;
}
