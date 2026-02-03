import { parseJsonFromCliOutput } from "../lib/cli-output.js";
import { resolveCli } from "../lib/openclaw-cli.js";
import { parsePositiveInt } from "../lib/utils.js";
import type { CommandRunner } from "../lib/runner.js";

const DEFAULT_DISCORD_TOKEN_TIMEOUT_MS = 20_000;

export async function saveDiscordToken(runCommand: CommandRunner, token: string) {
  const cli = resolveCli();
  const args = ["config", "set", "channels.discord.token", token];
  const timeoutMs =
    parsePositiveInt(process.env.MANAGER_DISCORD_TOKEN_TIMEOUT_MS) ??
    DEFAULT_DISCORD_TOKEN_TIMEOUT_MS;
  const setResult = await runCommandStep(
    runCommand,
    cli.command,
    "config set token",
    args,
    timeoutMs
  );
  if (!setResult.ok) {
    return { ok: false, error: formatStepError(setResult, timeoutMs) };
  }

  const allowResult = await ensureDiscordDmAllow(runCommand, cli.command, timeoutMs);
  if (!allowResult.ok) {
    return { ok: false, error: allowResult.error };
  }
  return { ok: true } as const;
}

export async function approveDiscordPairing(runCommand: CommandRunner, code: string) {
  const cli = resolveCli();
  const args = ["pairing", "approve", "discord", code];
  return runCommand(cli.command, args, 8000)
    .then(() => ({ ok: true } as const))
    .catch((err: unknown) => ({
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    }));
}

async function ensureDiscordDmAllow(
  runCommand: CommandRunner,
  command: string,
  timeoutMs: number
) {
  const getResult = await runCommandStep(
    runCommand,
    command,
    "config get allowFrom",
    ["config", "get", "channels.discord.dm.allowFrom", "--json"],
    timeoutMs
  );

  if (getResult.ok) {
    const parsed = parseJsonFromCliOutput(getResult.output);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { ok: true } as const;
    }
  }

  const setResult = await runCommandStep(
    runCommand,
    command,
    "config set allowFrom",
    ["config", "set", "channels.discord.dm.allowFrom", "[\"*\"]"],
    timeoutMs
  );
  if (!setResult.ok) {
    return { ok: false, error: formatStepError(setResult, timeoutMs) } as const;
  }
  return { ok: true } as const;
}

async function runCommandStep(
  runCommand: CommandRunner,
  command: string,
  step: string,
  args: string[],
  timeoutMs: number
): Promise<
  | { ok: true; step: string; output: string; elapsedMs: number }
  | { ok: false; step: string; error: string; elapsedMs: number }
> {
  const started = Date.now();
  try {
    const output = await runCommand(command, args, timeoutMs);
    return {
      ok: true,
      step,
      output,
      elapsedMs: Date.now() - started
    };
  } catch (err: unknown) {
    return {
      ok: false,
      step,
      error: err instanceof Error ? err.message : String(err),
      elapsedMs: Date.now() - started
    };
  }
}

function formatStepError(
  result: { step: string; error: string; elapsedMs: number },
  timeoutMs: number
) {
  return `${result.step} failed after ${result.elapsedMs}ms (timeout ${timeoutMs}ms): ${result.error}`;
}
