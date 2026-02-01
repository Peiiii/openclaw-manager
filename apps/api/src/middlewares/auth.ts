import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

import { resolveAuthState, verifyAuthHeader } from "../lib/auth.js";
import { getSessionCookieName, resolveSessionSecret, verifySessionToken } from "../lib/auth-session.js";
import type { ApiDeps } from "../deps.js";

export function createAuthMiddleware(deps: ApiDeps): MiddlewareHandler {
  return async (c, next) => {
    const pathName = c.req.path;
    if (pathName.startsWith("/api/auth/")) {
      return next();
    }
    if (deps.auth.disabled) {
      return next();
    }

    const authState = resolveAuthState(deps.auth.disabled);
    if (!authState.configured) {
      if (deps.auth.allowUnconfigured) return next();
      return c.json({ ok: false, error: "auth not configured" }, 401);
    }

    const header = c.req.header("authorization");
    if (header && verifyAuthHeader(header, authState)) {
      return next();
    }

    const secret = resolveSessionSecret(deps.auth.disabled);
    if (secret) {
      const session = getCookie(c, getSessionCookieName());
      if (session) {
        const verified = verifySessionToken(session, secret);
        if (verified.ok) {
          return next();
        }
      }
    }

    return c.json({ ok: false, error: "unauthorized" }, 401);

  };
}
