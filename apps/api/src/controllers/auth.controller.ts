import type { Handler } from "hono";
import { setCookie } from "hono/cookie";

import type { ApiDeps } from "../deps.js";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionTtlSeconds,
  resolveSessionSecret
} from "../lib/auth-session.js";
import { getAuthStatus, loginWithCredentials } from "../services/auth.service.js";

export function createAuthStatusHandler(deps: ApiDeps): Handler {
  return (c) => {
    const status = getAuthStatus(deps.auth.disabled);
    return c.json({ ok: true, ...status });
  };
}

export function createAuthLoginHandler(deps: ApiDeps): Handler {
  return async (c) => {
    const body = await c.req.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const result = loginWithCredentials(deps.auth.disabled, username, password);
    if (result.ok) {
      const secret = resolveSessionSecret(deps.auth.disabled);
      if (secret) {
        const token = createSessionToken(username, secret);
        setCookie(c, getSessionCookieName(), token, {
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
          secure: c.req.url.startsWith("https://"),
          maxAge: getSessionTtlSeconds()
        });
      }
      return c.json({ ok: true, disabled: result.disabled });
    }
    return c.json({ ok: false, error: result.error }, result.status);
  };
}
