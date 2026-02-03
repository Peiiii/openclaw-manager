import type { CommandRunner } from "./runner.js";
import { findOnPath } from "./runner.js";

export const OPENCLAW_CLI = {
  command: "openclaw",
  packageName: "openclaw",
  displayName: "OpenClaw"
} as const;

export type CliCandidate = typeof OPENCLAW_CLI;

export type CliResolution = CliCandidate & {
  path: string | null;
};

export type CliStatus = CliResolution & {
  installed: boolean;
  version: string | null;
};

export function resolveCli(): CliResolution {
  const pathMatch = findOnPath(OPENCLAW_CLI.command);
  return { ...OPENCLAW_CLI, path: pathMatch ?? null };
}

export async function getCliStatus(runCommand: CommandRunner): Promise<CliStatus> {
  const resolved = resolveCli();
  if (!resolved.path) {
    return {
      ...resolved,
      installed: false,
      version: null
    };
  }

  const version = await runCommand(resolved.path, ["--version"], 2000).catch(() => null);
  return {
    ...resolved,
    installed: true,
    version: version?.trim() ?? null
  };
}

export async function runCliInstall(
  install: (candidate: CliCandidate) => Promise<unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await install(OPENCLAW_CLI);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
