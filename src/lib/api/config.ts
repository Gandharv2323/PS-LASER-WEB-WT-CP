/** API base URLs (CONTRACT ports). Override with env vars when deploying. */
export const SPRING_API = process.env.SPRING_API_URL ?? process.env.NEXT_PUBLIC_SPRING_API_URL ?? "http://localhost:8081";
export const NODE_API = process.env.NODE_API_URL ?? process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";

/** Browser-side STOMP endpoint (Spring `registerStompEndpoints`, raw WebSocket). */
export const SPRING_WS = process.env.NEXT_PUBLIC_SPRING_WS_URL ?? "ws://localhost:8081/ws";

/** httpOnly cookie that holds the Spring JWT for /dashboard. */
export const AUTH_COOKIE = "psl_token";

/** Dev default from CONTRACT "Auth" (used to verify the JWT signature server-side). */
export const JWT_SECRET = process.env.JWT_SECRET ?? "pslaser-dev-secret-change-me-0123456789abcdef";

/** Fail fast when a backend is down so pages fall back quickly instead of hanging. */
export const API_TIMEOUT_MS = 3000;
