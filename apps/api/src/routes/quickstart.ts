import type { Hono } from "hono";

import { DEFAULT_GATEWAY_HOST, DEFAULT_GATEWAY_PORT } from "../lib/constants.js";
import { checkGateway, waitForGateway } from "../lib/gateway.js";
import { getCliStatus } from "../lib/system.js";
import { parsePort } from "../lib/utils.js";
import { setLastProbe } from "../lib/onboarding.js";
import type { ApiDeps } from "../deps.js";

export function registerQuickstartRoutes(app: Hono, deps: ApiDeps) {
  app.post("/api/quickstart", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      runProbe?: boolean;
      startGateway?: boolean;
      gatewayHost?: string;
      gatewayPort?: string;
    };
    const runProbe = Boolean(body?.runProbe);
    const startGateway = body?.startGateway !== false;
    const gatewayHost =
      typeof body?.gatewayHost === "string" ? body.gatewayHost : DEFAULT_GATEWAY_HOST;
    const gatewayPort =
      typeof body?.gatewayPort === "string"
        ? parsePort(body.gatewayPort) ?? DEFAULT_GATEWAY_PORT
        : DEFAULT_GATEWAY_PORT;

    let gatewayReady = false;
    let probeOk: boolean | undefined;

    const cli = await getCliStatus(deps.runCommand);
    if (!cli.installed) {
      return c.json({ ok: false, error: "clawdbot CLI not installed" }, 400);
    }

    if (startGateway) {
      const started = deps.processManager.startProcess("gateway-run");
      if (!started.ok) {
        return c.json({ ok: false, error: started.error }, 500);
      }
      gatewayReady = await waitForGateway(gatewayHost, gatewayPort, 12_000);
    } else {
      const snapshot = await checkGateway(gatewayHost, gatewayPort);
      gatewayReady = snapshot.ok;
    }

    if (runProbe) {
      probeOk = await deps
        .runCommand("clawdbot", ["channels", "status", "--probe"], 12_000)
        .then(() => true)
        .catch(() => false);
      setLastProbe(Boolean(probeOk));
    }

    return c.json({ ok: true, gatewayReady, probeOk });
  });
}
