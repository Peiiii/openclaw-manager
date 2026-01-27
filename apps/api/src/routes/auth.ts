import type { Hono } from "hono";

import { resolveAuthState } from "../lib/auth.js";
import type { ApiDeps } from "../deps.js";

export function registerAuthRoutes(app: Hono, deps: ApiDeps) {
  app.get("/api/auth/status", (c) => {
    const authState = resolveAuthState(deps.auth.disabled);
    return c.json({
      ok: true,
      required: !deps.auth.disabled,
      configured: authState.configured
    });
  });

  app.post("/api/auth/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (deps.auth.disabled) {
      return c.json({ ok: true, disabled: true });
    }
    const authState = resolveAuthState(deps.auth.disabled);
    if (!authState.configured) {
      return c.json({ ok: false, error: "auth not configured" }, 400);
    }
    if (!username || !password) {
      return c.json({ ok: false, error: "missing credentials" }, 400);
    }
    if (!authState.verify(username, password)) {
      return c.json({ ok: false, error: "invalid credentials" }, 401);
    }
    return c.json({ ok: true });
  });
}
