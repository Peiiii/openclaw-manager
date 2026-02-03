import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSON5 from "json5";

const CONFIG_FILENAME = "openclaw.json";
const STATE_DIRS = [".openclaw"] as const;

export type ConfigSnapshot =
  | { ok: true; path: string; raw: string; config: unknown }
  | { ok: false; path: string; reason: "missing" | "read" | "parse"; error: string };

function resolveUserPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("~")) {
    const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
    return path.resolve(expanded);
  }
  return path.resolve(trimmed);
}

function resolveStateDirCandidates(env: NodeJS.ProcessEnv): string[] {
  const override = env.OPENCLAW_STATE_DIR?.trim();
  if (override) {
    return [resolveUserPath(override)];
  }
  return STATE_DIRS.map((dir) => path.join(os.homedir(), dir));
}

export function resolveConfigCandidates(env: NodeJS.ProcessEnv = process.env): string[] {
  const explicit = env.OPENCLAW_CONFIG_PATH?.trim();
  if (explicit) {
    return [resolveUserPath(explicit)];
  }

  const candidates: string[] = [];
  const stateDirs = resolveStateDirCandidates(env);
  for (const stateDir of stateDirs) {
    candidates.push(path.join(stateDir, CONFIG_FILENAME));
  }
  return candidates;
}

export function resolveConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  const candidates = resolveConfigCandidates(env);
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // ignore
    }
  }
  return candidates[0] ?? path.join(os.homedir(), ".openclaw", CONFIG_FILENAME);
}

export function readConfigSnapshot(env: NodeJS.ProcessEnv = process.env): ConfigSnapshot {
  const configPath = resolveConfigPath(env);
  try {
    if (!fs.existsSync(configPath)) {
      return { ok: false, path: configPath, reason: "missing", error: "config not found" };
    }
  } catch (err) {
    return {
      ok: false,
      path: configPath,
      reason: "read",
      error: err instanceof Error ? err.message : String(err)
    };
  }

  let raw = "";
  try {
    raw = fs.readFileSync(configPath, "utf-8");
  } catch (err) {
    return {
      ok: false,
      path: configPath,
      reason: "read",
      error: err instanceof Error ? err.message : String(err)
    };
  }

  try {
    const config = JSON5.parse(raw);
    return { ok: true, path: configPath, raw, config };
  } catch (err) {
    return {
      ok: false,
      path: configPath,
      reason: "parse",
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
