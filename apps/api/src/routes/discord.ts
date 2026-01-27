import type { Hono } from "hono";

import type { ApiDeps } from "../deps.js";

export function registerDiscordRoutes(app: Hono, deps: ApiDeps) {
  app.post("/api/discord/token", async (c) => {
    const body = await c.req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) return c.json({ ok: false, error: "missing token" }, 400);

    const args = ["config", "set", "channels.discord.token", token];
    const result = await deps.runCommand("clawdbot", args, 8000).then(
      () => ({ ok: true }),
      (err: unknown) => ({ ok: false, error: err instanceof Error ? err.message : String(err) })
    );

    return c.json(result, result.ok ? 200 : 500);
  });

  app.post("/api/discord/pairing", async (c) => {
    const body = await c.req.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code) return c.json({ ok: false, error: "missing code" }, 400);

    const args = ["pairing", "approve", "discord", code];
    const result = await deps.runCommand("clawdbot", args, 8000).then(
      () => ({ ok: true }),
      (err: unknown) => ({ ok: false, error: err instanceof Error ? err.message : String(err) })
    );

    return c.json(result, result.ok ? 200 : 500);
  });
}
