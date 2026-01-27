import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import {
  DEFAULT_API_HOST,
  DEFAULT_API_PORT,
  DEFAULT_GATEWAY_HOST,
  DEFAULT_GATEWAY_PORT
} from "./lib/constants.js";
import { resolveRepoRoot, resolveWebDist } from "./lib/config.js";
import { resolveAuthState, verifyAuthHeader } from "./lib/auth.js";
import { createCommandRunner } from "./lib/runner.js";
import { getCliStatus, getSystemStatus } from "./lib/system.js";
import { buildCommandRegistry, createProcessManager, type CommandDefinition } from "./lib/commands.js";
import { checkGateway, waitForGateway } from "./lib/gateway.js";
import { getOnboardingStatus, setLastProbe } from "./lib/onboarding.js";
import { serveStaticFile } from "./lib/static.js";
import { parseOrigins, parsePort, parsePositiveInt } from "./lib/utils.js";

const app = new Hono();
const repoRoot = resolveRepoRoot();
const webDist = resolveWebDist(repoRoot);
const commandRegistry: CommandDefinition[] = buildCommandRegistry(repoRoot);
const processManager = createProcessManager(commandRegistry);
const runCommand = createCommandRunner(repoRoot);

const authDisabled = process.env.MANAGER_AUTH_DISABLED === "1";
const authAllowUnconfigured = process.env.MANAGER_AUTH_ALLOW_UNCONFIGURED === "1";

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      const allowed = new Set(
        [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5179",
          "http://127.0.0.1:5179"
        ].concat(parseOrigins(process.env.MANAGER_CORS_ORIGIN))
      );
      if (allowed.has("*")) return "*";
      if (allowed.has(origin)) return origin;
      return "null";
    },
    allowHeaders: ["Content-Type", "Authorization"]
  })
);

app.use("/api/*", async (c, next) => {
  const pathName = c.req.path;
  if (pathName.startsWith("/api/auth/")) {
    return next();
  }
  if (authDisabled) {
    return next();
  }

  const authState = resolveAuthState(authDisabled);
  if (!authState.configured) {
    if (authAllowUnconfigured) return next();
    return c.json({ ok: false, error: "auth not configured" }, 401);
  }

  const header = c.req.header("authorization");
  if (!header || !verifyAuthHeader(header, authState)) {
    return c.json({ ok: false, error: "unauthorized" }, 401);
  }

  return next();
});

app.get("/health", (c) => {
  return c.json({
    ok: true,
    time: new Date().toISOString(),
    version: "clawdbot-manager-api"
  });
});

app.get("/api/status", async (c) => {
  const gatewayHost = c.req.query("gatewayHost") ?? DEFAULT_GATEWAY_HOST;
  const gatewayPort = parsePort(c.req.query("gatewayPort")) ?? DEFAULT_GATEWAY_PORT;

  const [system, cli, gateway] = await Promise.all([
    getSystemStatus(),
    getCliStatus(runCommand),
    checkGateway(gatewayHost, gatewayPort)
  ]);
  const onboarding = await getOnboardingStatus(cli.installed, runCommand);

  return c.json({
    ok: true,
    now: new Date().toISOString(),
    system,
    cli,
    gateway,
    onboarding,
    commands: commandRegistry.map((cmd) => ({
      id: cmd.id,
      title: cmd.title,
      description: cmd.description,
      command: [cmd.command, ...cmd.args].join(" "),
      cwd: cmd.cwd,
      allowRun: cmd.allowRun
    })),
    processes: processManager.listProcesses()
  });
});

app.get("/api/processes", (c) => {
  return c.json({
    ok: true,
    processes: processManager.listProcesses()
  });
});

app.post("/api/processes/start", async (c) => {
  const body = await c.req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return c.json({ ok: false, error: "missing id" }, 400);

  const result = processManager.startProcess(id);
  return c.json(result.ok ? { ok: true, process: result.process } : result, result.ok ? 200 : 400);
});

app.post("/api/processes/stop", async (c) => {
  const body = await c.req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return c.json({ ok: false, error: "missing id" }, 400);

  const result = processManager.stopProcess(id);
  return c.json(result.ok ? { ok: true, process: result.process } : result, result.ok ? 200 : 400);
});

app.get("/api/auth/status", (c) => {
  const authState = resolveAuthState(authDisabled);
  return c.json({
    ok: true,
    required: !authDisabled,
    configured: authState.configured
  });
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (authDisabled) {
    return c.json({ ok: true, disabled: true });
  }
  const authState = resolveAuthState(authDisabled);
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

app.post("/api/cli/install", async (c) => {
  const cli = await getCliStatus(runCommand);
  if (cli.installed) {
    return c.json({ ok: true, alreadyInstalled: true, version: cli.version });
  }

  try {
    const timeoutMs = parsePositiveInt(process.env.MANAGER_CLI_INSTALL_TIMEOUT_MS) ?? 600_000;
    await runCommand(
      "npm",
      ["i", "-g", "clawdbot@latest"],
      timeoutMs,
      {
        ...process.env,
        NPM_CONFIG_AUDIT: "false",
        NPM_CONFIG_FUND: "false"
      }
    );
    const updated = await getCliStatus(runCommand);
    return c.json({ ok: true, version: updated.version });
  } catch (err) {
    return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

app.post("/api/discord/token", async (c) => {
  const body = await c.req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) return c.json({ ok: false, error: "missing token" }, 400);

  const args = ["config", "set", "channels.discord.token", token];
  const result = await runCommand("clawdbot", args, 8000).then(
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
  const result = await runCommand("clawdbot", args, 8000).then(
    () => ({ ok: true }),
    (err: unknown) => ({ ok: false, error: err instanceof Error ? err.message : String(err) })
  );

  return c.json(result, result.ok ? 200 : 500);
});

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

  const cli = await getCliStatus(runCommand);
  if (!cli.installed) {
    return c.json({ ok: false, error: "clawdbot CLI not installed" }, 400);
  }

  if (startGateway) {
    const started = processManager.startProcess("gateway-run");
    if (!started.ok) {
      return c.json({ ok: false, error: started.error }, 500);
    }
    gatewayReady = await waitForGateway(gatewayHost, gatewayPort, 12_000);
  } else {
    const snapshot = await checkGateway(gatewayHost, gatewayPort);
    gatewayReady = snapshot.ok;
  }

  if (runProbe) {
    probeOk = await runCommand("clawdbot", ["channels", "status", "--probe"], 12_000)
      .then(() => true)
      .catch(() => false);
    setLastProbe(Boolean(probeOk));
  }

  return c.json({ ok: true, gatewayReady, probeOk });
});

const host =
  process.env.MANAGER_API_HOST ?? process.env.ONBOARDING_API_HOST ?? DEFAULT_API_HOST;
const port =
  parsePort(process.env.MANAGER_API_PORT ?? process.env.ONBOARDING_API_PORT) ??
  DEFAULT_API_PORT;

if (webDist) {
  app.get("*", async (c) => {
    const reqPath = c.req.path;
    if (reqPath.startsWith("/api") || reqPath === "/health") {
      return c.notFound();
    }
    return serveStaticFile(c.req.path, webDist);
  });
}

serve({
  fetch: app.fetch,
  hostname: host,
  port
});
