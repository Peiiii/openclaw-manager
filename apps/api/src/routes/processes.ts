import type { Hono } from "hono";

import type { ApiDeps } from "../deps.js";

export function registerProcessRoutes(app: Hono, deps: ApiDeps) {
  app.get("/api/processes", (c) => {
    return c.json({
      ok: true,
      processes: deps.processManager.listProcesses()
    });
  });

  app.post("/api/processes/start", async (c) => {
    const body = await c.req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : null;
    if (!id) return c.json({ ok: false, error: "missing id" }, 400);

    const result = deps.processManager.startProcess(id);
    return c.json(result.ok ? { ok: true, process: result.process } : result, result.ok ? 200 : 400);
  });

  app.post("/api/processes/stop", async (c) => {
    const body = await c.req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : null;
    if (!id) return c.json({ ok: false, error: "missing id" }, 400);

    const result = deps.processManager.stopProcess(id);
    return c.json(result.ok ? { ok: true, process: result.process } : result, result.ok ? 200 : 400);
  });
}
