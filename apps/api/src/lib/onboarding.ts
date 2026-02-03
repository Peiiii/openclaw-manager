import { ONBOARDING_CACHE_MS } from "./constants.js";
import { parseJsonFromCliOutput } from "./cli-output.js";
import { readConfigSnapshot } from "./openclaw-config.js";
import { resolveCli } from "./openclaw-cli.js";
import { parsePositiveInt } from "./utils.js";
import type { CommandRunner } from "./runner.js";

export type OnboardingStatus = {
  discord: {
    tokenConfigured: boolean;
    allowFromConfigured: boolean;
    pendingPairings: number;
  };
  ai: {
    configured: boolean;
    missingProviders: string[];
    error?: string | null;
  };
  probe: { ok: boolean; at: string } | null;
};

let onboardingCache: { at: number; data: OnboardingStatus } | null = null;
let lastProbe: { ok: boolean; at: string } | null = null;
let lastDiscordStatus: { tokenConfigured: boolean; allowFromConfigured: boolean; at: number } | null =
  null;

const DEFAULT_DISCORD_STATUS_STALE_MS = 30_000;

export function setLastProbe(ok: boolean) {
  lastProbe = { ok, at: new Date().toISOString() };
}

export async function getOnboardingStatus(
  cliInstalled: boolean,
  runCommand: CommandRunner
): Promise<OnboardingStatus> {
  const now = Date.now();
  if (onboardingCache && now - onboardingCache.at < ONBOARDING_CACHE_MS) {
    return onboardingCache.data;
  }

  if (!cliInstalled) {
    const data: OnboardingStatus = {
      discord: {
        tokenConfigured: false,
        allowFromConfigured: false,
        pendingPairings: 0
      },
      ai: {
        configured: false,
        missingProviders: []
      },
      probe: lastProbe
    };
    onboardingCache = { at: now, data };
    return data;
  }

  const cli = resolveCli();
  const [discordStatus, pendingPairings, aiStatus] = await Promise.all([
    readDiscordStatus(),
    readPendingDiscordPairings(runCommand, cli.command),
    readAiAuthStatus(runCommand, cli.command)
  ]);
  const [tokenConfigured, allowFromConfigured] = discordStatus;

  const data: OnboardingStatus = {
    discord: {
      tokenConfigured,
      allowFromConfigured,
      pendingPairings
    },
    ai: aiStatus,
    probe: lastProbe
  };
  onboardingCache = { at: now, data };
  return data;
}

async function readDiscordStatus(): Promise<[boolean, boolean]> {
  const envToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const envTokenConfigured = Boolean(envToken);

  const snapshot = readConfigSnapshot();
  if (snapshot.ok) {
    const tokenValue = resolveDiscordToken(snapshot.config);
    const tokenConfigured = envTokenConfigured || Boolean(tokenValue?.trim());
    const allowFromConfigured = resolveDiscordAllowFromConfigured(snapshot.config);
    persistDiscordStatus(tokenConfigured, allowFromConfigured);
    return [tokenConfigured, allowFromConfigured];
  }

  if (snapshot.reason === "missing") {
    const tokenConfigured = envTokenConfigured;
    const allowFromConfigured = false;
    persistDiscordStatus(tokenConfigured, allowFromConfigured);
    return [tokenConfigured, allowFromConfigured];
  }

  const fallback = resolveDiscordFallback();
  return [fallback.tokenConfigured, fallback.allowFromConfigured];
}

function persistDiscordStatus(tokenConfigured: boolean, allowFromConfigured: boolean) {
  lastDiscordStatus = {
    tokenConfigured,
    allowFromConfigured,
    at: Date.now()
  };
}

function resolveDiscordFallback() {
  const ttl =
    parsePositiveInt(process.env.MANAGER_DISCORD_STATUS_STALE_MS) ??
    DEFAULT_DISCORD_STATUS_STALE_MS;
  if (lastDiscordStatus && Date.now() - lastDiscordStatus.at < ttl) {
    return lastDiscordStatus;
  }
  return {
    tokenConfigured: false,
    allowFromConfigured: false,
    at: Date.now()
  };
}

function resolveDiscordToken(config: unknown): string | null {
  const direct = getPathValue(config, ["channels", "discord", "token"]);
  if (typeof direct === "string") {
    return resolveEnvRef(direct);
  }

  const accounts = getPathValue(config, ["channels", "discord", "accounts"]);
  if (accounts && typeof accounts === "object" && !Array.isArray(accounts)) {
    for (const value of Object.values(accounts as Record<string, unknown>)) {
      const token = getPathValue(value, ["token"]);
      if (typeof token === "string") {
        const resolved = resolveEnvRef(token);
        if (resolved?.trim()) {
          return resolved;
        }
      }
    }
  }
  return null;
}

function resolveDiscordAllowFromConfigured(config: unknown): boolean {
  const value = getPathValue(config, ["channels", "discord", "dm", "allowFrom"]);
  return Array.isArray(value) ? value.length > 0 : false;
}

function getPathValue(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null;
    }
    if (Array.isArray(current)) {
      return null;
    }
    const record = current as Record<string, unknown>;
    if (!(segment in record)) {
      return null;
    }
    current = record[segment];
  }
  return current;
}

function resolveEnvRef(raw: string): string {
  const trimmed = raw.trim();
  const match = /^\$\{([A-Z0-9_]+)\}$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const envKey = match[1];
  return process.env[envKey]?.trim() ?? "";
}

async function readPendingDiscordPairings(
  runCommand: CommandRunner,
  command: string
): Promise<number> {
  try {
    const output = await runCommand(
      command,
      ["pairing", "list", "--channel", "discord", "--json"],
      4000
    );
    const parsed = parseJsonFromCliOutput(output) as { requests?: unknown[] } | null;
    return Array.isArray(parsed?.requests) ? parsed.requests.length : 0;
  } catch {
    return 0;
  }
}

async function readAiAuthStatus(runCommand: CommandRunner, command: string) {
  try {
    const output = await runCommand(command, ["models", "status", "--json"], 8000);
    const parsed = parseJsonFromCliOutput(output) as {
      auth?: { missingProvidersInUse?: unknown };
    } | null;
    const missing = Array.isArray(parsed?.auth?.missingProvidersInUse)
      ? parsed.auth?.missingProvidersInUse.map((item) => String(item))
      : [];
    return {
      configured: missing.length === 0,
      missingProviders: missing
    };
  } catch (err) {
    return {
      configured: false,
      missingProviders: [],
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
