import { ONBOARDING_CACHE_MS } from "./constants.js";
import type { CommandRunner } from "./runner.js";

export type OnboardingStatus = {
  discord: {
    tokenConfigured: boolean;
    allowFromConfigured: boolean;
    pendingPairings: number;
  };
  probe: { ok: boolean; at: string } | null;
};

let onboardingCache: { at: number; data: OnboardingStatus } | null = null;
let lastProbe: { ok: boolean; at: string } | null = null;

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
      probe: lastProbe
    };
    onboardingCache = { at: now, data };
    return data;
  }

  const [tokenConfigured, allowFromConfigured, pendingPairings] = await Promise.all([
    readDiscordTokenConfigured(runCommand),
    readDiscordAllowFromConfigured(runCommand),
    readPendingDiscordPairings(runCommand)
  ]);

  const data: OnboardingStatus = {
    discord: {
      tokenConfigured,
      allowFromConfigured,
      pendingPairings
    },
    probe: lastProbe
  };
  onboardingCache = { at: now, data };
  return data;
}

async function readConfigValue(runCommand: CommandRunner, pathKey: string) {
  try {
    const output = await runCommand("clawdbot", ["config", "get", pathKey, "--json"], 4000);
    return JSON.parse(output) as unknown;
  } catch {
    return null;
  }
}

async function readDiscordTokenConfigured(runCommand: CommandRunner): Promise<boolean> {
  const value = await readConfigValue(runCommand, "channels.discord.token");
  return typeof value === "string" ? value.trim().length > 0 : false;
}

async function readDiscordAllowFromConfigured(runCommand: CommandRunner): Promise<boolean> {
  const value = await readConfigValue(runCommand, "channels.discord.dm.allowFrom");
  if (Array.isArray(value)) return value.length > 0;
  if (value === "*") return true;
  return false;
}

async function readPendingDiscordPairings(runCommand: CommandRunner): Promise<number> {
  try {
    const output = await runCommand(
      "clawdbot",
      ["pairing", "list", "--channel", "discord", "--json"],
      4000
    );
    const parsed = JSON.parse(output) as { requests?: unknown[] };
    return Array.isArray(parsed?.requests) ? parsed.requests.length : 0;
  } catch {
    return 0;
  }
}
