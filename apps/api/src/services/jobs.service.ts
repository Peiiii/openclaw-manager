import type { ApiDeps } from "../deps.js";
import { getCliStatus } from "../lib/system.js";
import { runCommandWithLogs } from "../lib/runner.js";
import { parsePositiveInt, sleep } from "../lib/utils.js";
import { runQuickstart, type QuickstartRequest } from "./quickstart.service.js";
import { downloadResource, type DownloadOptions } from "./resource.service.js";

const MINIMAX_CN_BASE_URL = "https://api.minimaxi.com/anthropic";
const DEFAULT_PAIRING_WAIT_TIMEOUT_MS = 180_000;
const DEFAULT_PAIRING_POLL_MS = 3000;
const DEFAULT_PAIRING_APPROVE_TIMEOUT_MS = 8000;

export function createCliInstallJob(deps: ApiDeps) {
  const job = deps.jobStore.createJob("Install OpenClaw CLI");
  deps.jobStore.startJob(job.id);
  deps.jobStore.appendLog(job.id, "开始安装 OpenClaw CLI...");

  const timeoutMs = parsePositiveInt(process.env.MANAGER_CLI_INSTALL_TIMEOUT_MS) ?? 600_000;

  void (async () => {
    const current = await getCliStatus(deps.runCommand);
    if (current.installed) {
      deps.jobStore.appendLog(job.id, `CLI 已安装${current.version ? `（${current.version}）` : ""}。`);
      deps.jobStore.completeJob(job.id, { version: current.version ?? null });
      return;
    }

    await runCommandWithLogs("npm", ["i", "-g", "clawdbot@latest"], {
      cwd: deps.repoRoot,
      env: {
        ...process.env,
        NPM_CONFIG_AUDIT: "false",
        NPM_CONFIG_FUND: "false"
      },
      timeoutMs,
      onLog: (line) => deps.jobStore.appendLog(job.id, line)
    });

    const cli = await getCliStatus(deps.runCommand);
    if (cli.version) {
      deps.jobStore.appendLog(job.id, `CLI 版本: ${cli.version}`);
    }
    deps.jobStore.completeJob(job.id, { version: cli.version ?? null });
  })().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    deps.jobStore.appendLog(job.id, `安装失败: ${message}`);
    deps.jobStore.failJob(job.id, message);
  });

  return job.id;
}

export function createQuickstartJob(deps: ApiDeps, body: QuickstartRequest) {
  const job = deps.jobStore.createJob("Quickstart");
  deps.jobStore.startJob(job.id);
  deps.jobStore.appendLog(job.id, "开始执行快速启动...");

  void runQuickstart(deps, body, (line) => deps.jobStore.appendLog(job.id, line))
    .then((result) => {
      if (!result.ok) {
        deps.jobStore.appendLog(job.id, `快速启动失败: ${result.error}`);
        deps.jobStore.failJob(job.id, result.error);
        return;
      }
      deps.jobStore.appendLog(job.id, "快速启动完成。");
      deps.jobStore.completeJob(job.id, {
        gatewayReady: result.gatewayReady,
        probeOk: result.probeOk ?? null
      });
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      deps.jobStore.appendLog(job.id, `快速启动失败: ${message}`);
      deps.jobStore.failJob(job.id, message);
    });

  return job.id;
}

export function createDiscordPairingJob(deps: ApiDeps, code: string) {
  const job = deps.jobStore.createJob("Discord Pairing");
  deps.jobStore.startJob(job.id);
  deps.jobStore.appendLog(job.id, "开始处理配对请求...");

  void runCommandWithLogs("clawdbot", ["pairing", "approve", "discord", code], {
    cwd: deps.repoRoot,
    env: process.env,
    timeoutMs: 8000,
    onLog: (line) => deps.jobStore.appendLog(job.id, line)
  })
    .then(() => {
      deps.jobStore.appendLog(job.id, "配对已提交。");
      deps.jobStore.completeJob(job.id, { code });
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      deps.jobStore.appendLog(job.id, `配对失败: ${message}`);
      deps.jobStore.failJob(job.id, message);
    });

  return job.id;
}

export function createDiscordPairingWaitJob(
  deps: ApiDeps,
  options: { timeoutMs?: number | string; pollMs?: number | string; notify?: boolean }
) {
  const job = deps.jobStore.createJob("Discord Pairing Wait");
  deps.jobStore.startJob(job.id);
  deps.jobStore.appendLog(job.id, "等待配对请求...");

  const timeoutMs =
    parsePositiveInt(toOptionalString(options.timeoutMs)) ??
    parsePositiveInt(process.env.MANAGER_PAIRING_TIMEOUT_MS) ??
    DEFAULT_PAIRING_WAIT_TIMEOUT_MS;
  const pollMs =
    parsePositiveInt(toOptionalString(options.pollMs)) ??
    parsePositiveInt(process.env.MANAGER_PAIRING_POLL_MS) ??
    DEFAULT_PAIRING_POLL_MS;
  const notify = Boolean(options.notify);

  void (async () => {
    const startedAt = Date.now();
    let lastCount = -1;
    while (Date.now() - startedAt < timeoutMs) {
      const snapshot = await fetchDiscordPairings(deps);
      if (snapshot.error) {
        deps.jobStore.appendLog(job.id, `读取配对请求失败: ${snapshot.error}`);
      }
      if (snapshot.count !== lastCount) {
        deps.jobStore.appendLog(job.id, `待处理配对请求: ${snapshot.count}`);
        lastCount = snapshot.count;
      }
      if (snapshot.code) {
        deps.jobStore.appendLog(job.id, "发现配对请求，开始批准...");
        const args = notify
          ? ["pairing", "approve", "--notify", "discord", snapshot.code]
          : ["pairing", "approve", "discord", snapshot.code];
        await runCommandWithLogs("clawdbot", args, {
          cwd: deps.repoRoot,
          env: process.env,
          timeoutMs: DEFAULT_PAIRING_APPROVE_TIMEOUT_MS,
          onLog: (line) => deps.jobStore.appendLog(job.id, line)
        });
        deps.jobStore.appendLog(job.id, "配对已提交。");
        deps.jobStore.completeJob(job.id, { approved: true, notified: notify });
        return;
      }
      await sleep(pollMs);
    }
    deps.jobStore.appendLog(job.id, "等待配对超时。");
    deps.jobStore.failJob(job.id, "pairing timeout");
  })().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    deps.jobStore.appendLog(job.id, `配对失败: ${message}`);
    deps.jobStore.failJob(job.id, message);
  });

  return job.id;
}

export function createResourceDownloadJob(
  deps: ApiDeps,
  options: { url?: string; filename?: string }
) {
  const job = deps.jobStore.createJob("Download Resources");
  deps.jobStore.startJob(job.id);

  const envUrl = process.env.MANAGER_RESOURCE_URL;
  const url = options.url?.trim() || envUrl?.trim() || "";
  const dir = process.env.MANAGER_RESOURCE_DIR;
  const payload: DownloadOptions = {
    url,
    filename: options.filename,
    dir: dir?.trim() || undefined
  };

  if (!payload.url) {
    deps.jobStore.appendLog(job.id, "未配置资源地址。");
    deps.jobStore.failJob(job.id, "resource url missing");
    return job.id;
  }

  void downloadResource(payload, (line) => deps.jobStore.appendLog(job.id, line))
    .then((result) => {
      deps.jobStore.completeJob(job.id, result);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      deps.jobStore.appendLog(job.id, `下载失败: ${message}`);
      deps.jobStore.failJob(job.id, message);
    });

  return job.id;
}

function toOptionalString(value: number | string | undefined) {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return undefined;
}

async function fetchDiscordPairings(deps: ApiDeps): Promise<{
  code: string | null;
  count: number;
  error?: string;
}> {
  try {
    const output = await deps.runCommand(
      "clawdbot",
      ["pairing", "list", "--channel", "discord", "--json"],
      8000
    );
    const parsed = JSON.parse(output) as {
      requests?: Array<{ code?: string; pairingCode?: string }>;
    };
    const requests = Array.isArray(parsed?.requests) ? parsed.requests : [];
    const first = requests[0];
    const codeRaw = typeof first?.code === "string" ? first.code : first?.pairingCode;
    const code = typeof codeRaw === "string" && codeRaw.trim() ? codeRaw.trim() : null;
    return { code, count: requests.length };
  } catch (err) {
    return {
      code: null,
      count: 0,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export function createAiAuthJob(
  deps: ApiDeps,
  options: { provider: string; apiKey: string }
) {
  const job = deps.jobStore.createJob("Configure AI Provider");
  deps.jobStore.startJob(job.id);
  deps.jobStore.appendLog(job.id, "开始配置 AI 凭证...");

  const provider = options.provider.trim().toLowerCase();
  const config = resolveAiProviderConfig(provider);
  if (!config) {
    deps.jobStore.appendLog(job.id, `不支持的 provider: ${provider}`);
    deps.jobStore.failJob(job.id, "unsupported provider");
    return job.id;
  }

  const apiKey = options.apiKey.trim();
  if (!apiKey) {
    deps.jobStore.appendLog(job.id, "API Key 为空。");
    deps.jobStore.failJob(job.id, "missing api key");
    return job.id;
  }

  const timeoutMs = parsePositiveInt(process.env.MANAGER_AI_AUTH_TIMEOUT_MS) ?? 120_000;
  const args = [
    "onboard",
    "--non-interactive",
    "--accept-risk",
    "--flow",
    "manual",
    "--mode",
    "local",
    "--auth-choice",
    config.authChoice,
    "--skip-channels",
    "--skip-skills",
    "--skip-health",
    "--skip-ui",
    "--skip-daemon"
  ];

  void (async () => {
    await runCommandWithLogs("clawdbot", args, {
      cwd: deps.repoRoot,
      env: {
        ...process.env,
        [config.envVar]: apiKey
      },
      timeoutMs,
      onLog: (line) => deps.jobStore.appendLog(job.id, line)
    });
    if (provider === "minimax-cn") {
      await applyMinimaxCnConfig(deps, job.id, timeoutMs);
    }
    deps.jobStore.appendLog(job.id, "AI 凭证配置完成。");
    deps.jobStore.completeJob(job.id, { provider });
  })().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    deps.jobStore.appendLog(job.id, `AI 配置失败: ${message}`);
    deps.jobStore.failJob(job.id, message);
  });

  return job.id;
}

function resolveAiProviderConfig(
  provider: string
): { authChoice: string; envVar: string } | null {
  if (provider === "anthropic") {
    return { authChoice: "apiKey", envVar: "ANTHROPIC_API_KEY" };
  }
  if (provider === "openai") {
    return { authChoice: "openai-api-key", envVar: "OPENAI_API_KEY" };
  }
  if (provider === "openrouter") {
    return { authChoice: "openrouter-api-key", envVar: "OPENROUTER_API_KEY" };
  }
  if (provider === "ai-gateway") {
    return { authChoice: "ai-gateway-api-key", envVar: "AI_GATEWAY_API_KEY" };
  }
  if (provider === "gemini") {
    return { authChoice: "gemini-api-key", envVar: "GEMINI_API_KEY" };
  }
  if (provider === "zai") {
    return { authChoice: "zai-api-key", envVar: "ZAI_API_KEY" };
  }
  if (provider === "moonshot") {
    return { authChoice: "moonshot-api-key", envVar: "MOONSHOT_API_KEY" };
  }
  if (provider === "kimi-code") {
    return { authChoice: "kimi-code-api-key", envVar: "KIMI_CODE_API_KEY" };
  }
  if (provider === "minimax") {
    return { authChoice: "minimax-api", envVar: "MINIMAX_API_KEY" };
  }
  if (provider === "minimax-cn") {
    return { authChoice: "minimax-api", envVar: "MINIMAX_API_KEY" };
  }
  if (provider === "minimax-lightning") {
    return { authChoice: "minimax-api-lightning", envVar: "MINIMAX_API_KEY" };
  }
  if (provider === "venice") {
    return { authChoice: "venice-api-key", envVar: "VENICE_API_KEY" };
  }
  if (provider === "synthetic") {
    return { authChoice: "synthetic-api-key", envVar: "SYNTHETIC_API_KEY" };
  }
  if (provider === "opencode-zen") {
    return { authChoice: "opencode-zen", envVar: "OPENCODE_ZEN_API_KEY" };
  }
  return null;
}

async function applyMinimaxCnConfig(deps: ApiDeps, jobId: string, timeoutMs: number) {
  deps.jobStore.appendLog(jobId, "配置 MiniMax 国内 API 地址...");
  await runCommandWithLogs(
    "clawdbot",
    ["config", "set", "models.providers.minimax.baseUrl", MINIMAX_CN_BASE_URL],
    {
      cwd: deps.repoRoot,
      env: process.env,
      timeoutMs,
      onLog: (line) => deps.jobStore.appendLog(jobId, line)
    }
  );
  deps.jobStore.appendLog(jobId, "配置 MiniMax 国内鉴权头...");
  await runCommandWithLogs(
    "clawdbot",
    ["config", "set", "models.providers.minimax.authHeader", "true", "--json"],
    {
      cwd: deps.repoRoot,
      env: process.env,
      timeoutMs,
      onLog: (line) => deps.jobStore.appendLog(jobId, line)
    }
  );
  deps.jobStore.appendLog(jobId, "MiniMax 国内配置完成。");
}
