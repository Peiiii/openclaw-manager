import type { Hono } from "hono";

import { getCliStatus } from "../lib/system.js";
import { parsePositiveInt } from "../lib/utils.js";
import type { ApiDeps } from "../deps.js";

export function registerCliRoutes(app: Hono, deps: ApiDeps) {
  app.post("/api/cli/install", async (c) => {
    const cli = await getCliStatus(deps.runCommand);
    if (cli.installed) {
      return c.json({ ok: true, alreadyInstalled: true, version: cli.version });
    }

    try {
      const timeoutMs = parsePositiveInt(process.env.MANAGER_CLI_INSTALL_TIMEOUT_MS) ?? 600_000;
      await deps.runCommand(
        "npm",
        ["i", "-g", "clawdbot@latest"],
        timeoutMs,
        {
          ...process.env,
          NPM_CONFIG_AUDIT: "false",
          NPM_CONFIG_FUND: "false"
        }
      );
      const updated = await getCliStatus(deps.runCommand);
      return c.json({ ok: true, version: updated.version });
    } catch (err) {
      return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
    }
  });
}
