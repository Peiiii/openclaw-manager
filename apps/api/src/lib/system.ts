import { REQUIRED_NODE_MAJOR } from "./constants.js";
import { findOnPath, type CommandRunner } from "./runner.js";

export async function getSystemStatus() {
  const major = parseMajor(process.version);
  return {
    node: {
      current: process.version,
      required: `>=${REQUIRED_NODE_MAJOR}`,
      ok: major >= REQUIRED_NODE_MAJOR
    },
    platform: process.platform,
    arch: process.arch
  };
}

export async function getCliStatus(runCommand: CommandRunner) {
  const pathMatch = findOnPath("clawdbot");
  if (!pathMatch) {
    return { installed: false, path: null, version: null };
  }

  const version = await runCommand(pathMatch, ["--version"], 2000).catch(() => null);
  return {
    installed: true,
    path: pathMatch,
    version: version?.trim() ?? null
  };
}

function parseMajor(version: string): number {
  const cleaned = version.replace(/^v/, "");
  const [major] = cleaned.split(".");
  return Number(major);
}
