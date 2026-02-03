import { DEFAULT_GATEWAY_HOST, DEFAULT_GATEWAY_PORT } from "../lib/constants.js";
import { checkGateway, waitForGateway } from "../lib/gateway.js";
import { runCommandWithLogs } from "../lib/runner.js";
import { getCliStatus } from "../lib/openclaw-cli.js";
import { parsePort, parsePositiveInt, sleep } from "../lib/utils.js";
import { setLastProbe } from "../lib/onboarding.js";
import type { ApiDeps } from "../deps.js";

export type QuickstartRequest = {
  runProbe?: boolean;
  startGateway?: boolean;
  gatewayHost?: string;
  gatewayPort?: string;
};

type QuickstartResult =
  | { ok: true; gatewayReady: boolean; probeOk?: boolean }
  | { ok: false; error: string; status: 400 | 500 | 504 };

export async function runQuickstart(
  deps: ApiDeps,
  body: QuickstartRequest,
  log?: (line: string) => void
): Promise<QuickstartResult> {
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
  const gatewayTimeoutMs = parsePositiveInt(process.env.MANAGER_GATEWAY_TIMEOUT_MS) ?? 60_000;
  log?.(
    `Gateway params: host=${gatewayHost} port=${gatewayPort} timeout=${gatewayTimeoutMs}ms`
  );

  log?.("Checking CLI environment...");
  const cli = await getCliStatus(deps.runCommand);
  if (!cli.installed) {
    log?.("OpenClaw CLI not detected.");
    return { ok: false, error: `${cli.displayName} CLI not installed`, status: 400 };
  }
  if (cli.path) {
    log?.(`CLI path: ${cli.path}`);
  }
  if (cli.version) {
    log?.(`CLI version: ${cli.version}`);
  }

  if (startGateway) {
    log?.("Initializing gateway configuration...");
    await runCommandWithLogs(cli.command, ["config", "set", "gateway.mode", "local"], {
      cwd: deps.repoRoot,
      env: process.env,
      timeoutMs: 8000,
      onLog: (line) => log?.(`[config] ${line}`)
    });

    const gatewayArgs = [
      "gateway",
      "run",
      "--allow-unconfigured",
      "--bind",
      "loopback",
      "--port",
      String(gatewayPort),
      "--force"
    ];

    log?.("Starting gateway...");
    log?.(`Start command: ${cli.command} ${gatewayArgs.join(" ")}`);
    const started = deps.processManager.startProcess("gateway-run", {
      args: gatewayArgs,
      onLog: (line) => log?.(`[gateway] ${line}`)
    });
    if (!started.ok) {
      return { ok: false, error: started.error ?? "unknown", status: 500 };
    }
    await sleep(500);
    const earlySnapshot = deps.processManager
      .listProcesses()
      .find((process) => process.id === "gateway-run");
    if (earlySnapshot && !earlySnapshot.running) {
      if (earlySnapshot.lastLines.length) {
        log?.("Gateway process exited. Output:");
        for (const line of earlySnapshot.lastLines) {
          log?.(`[gateway] ${line}`);
        }
      }
      return { ok: false, error: "gateway process exited", status: 500 };
    }

    gatewayReady = await waitForGateway(gatewayHost, gatewayPort, gatewayTimeoutMs);
    if (!gatewayReady) {
      log?.("Gateway start timed out.");
      const probe = await checkGateway(gatewayHost, gatewayPort);
      log?.(
        `Gateway probe result: ok=${probe.ok} error=${probe.error ?? "none"} latency=${
          probe.latencyMs ?? "n/a"
        }ms`
      );
      const snapshot = deps.processManager
        .listProcesses()
        .find((process) => process.id === "gateway-run");
      if (snapshot?.lastLines?.length) {
        log?.("Gateway process output (recent logs):");
        for (const line of snapshot.lastLines) {
          log?.(`[gateway] ${line}`);
        }
      }
      if (snapshot && snapshot.exitCode !== null) {
        log?.(`Gateway process exited, exit code: ${snapshot.exitCode}`);
      }
      if (snapshot) {
        log?.(
          `Gateway process status: running=${snapshot.running} pid=${snapshot.pid ?? "?"}`
        );
      }
      log?.(
        `Troubleshooting: ensure port ${gatewayPort} is free, or run ${cli.command} logs --follow to inspect gateway logs.`
      );
      return { ok: false, error: "gateway not ready", status: 504 };
    }
    log?.("Gateway is ready.");
  } else {
    log?.("Checking gateway status...");
    const snapshot = await checkGateway(gatewayHost, gatewayPort);
    gatewayReady = snapshot.ok;
    if (!gatewayReady) {
      log?.(
        `Gateway not ready: error=${snapshot.error ?? "none"} latency=${snapshot.latencyMs ?? "n/a"}ms`
      );
    } else {
      log?.("Gateway is ready.");
    }
  }

  if (runProbe) {
    const probeAttempts = parsePositiveInt(process.env.MANAGER_PROBE_ATTEMPTS) ?? 3;
    const probeDelayMs = parsePositiveInt(process.env.MANAGER_PROBE_DELAY_MS) ?? 2000;
    log?.("Running channel probe...");
    for (let attempt = 1; attempt <= probeAttempts; attempt += 1) {
      probeOk = await deps
        .runCommand(cli.command, ["channels", "status", "--probe"], 12_000)
        .then(() => true)
        .catch(() => false);
      if (probeOk || attempt >= probeAttempts) break;
      log?.(
        `Channel probe failed, retrying in ${probeDelayMs}ms (${attempt}/${probeAttempts})...`
      );
      await sleep(probeDelayMs);
    }
    setLastProbe(Boolean(probeOk));
    log?.(probeOk ? "Channel probe passed." : "Channel probe failed.");
  }

  return { ok: true, gatewayReady, probeOk };
}
