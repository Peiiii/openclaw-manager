import type { Hono } from "hono";

export function registerHealthRoutes(app: Hono) {
  app.get("/health", (c) => {
    return c.json({
      ok: true,
      time: new Date().toISOString(),
      version: "clawdbot-manager-api"
    });
  });
}
