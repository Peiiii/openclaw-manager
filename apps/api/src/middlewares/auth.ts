import type { MiddlewareHandler } from "hono";

import { resolveAuthState, verifyAuthHeader } from "../lib/auth.js";
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
    if (!header || !verifyAuthHeader(header, authState)) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    return next();
  };
}
