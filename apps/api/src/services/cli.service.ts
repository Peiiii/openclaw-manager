import { getCliStatus, OPENCLAW_CLI, runCliInstall } from "../lib/openclaw-cli.js";
import { parsePositiveInt } from "../lib/utils.js";
import type { CommandRunner } from "../lib/runner.js";

export async function installCli(runCommand: CommandRunner) {
  const cli = await getCliStatus(runCommand);
  if (cli.installed) {
    return { ok: true, alreadyInstalled: true, version: cli.version } as const;
  }

  const timeoutMs = parsePositiveInt(process.env.MANAGER_CLI_INSTALL_TIMEOUT_MS) ?? 600_000;

  const result = await runCliInstall((candidate) =>
    runCommand(
      "npm",
      ["i", "-g", `${candidate.packageName}@latest`],
      timeoutMs,
      {
        ...process.env,
        NPM_CONFIG_AUDIT: "false",
        NPM_CONFIG_FUND: "false"
      }
    )
  );

  if (!result.ok) {
    return { ok: false, error: result.error } as const;
  }

  const updated = await getCliStatus(runCommand);
  return {
    ok: true,
    version: updated.version,
    installedPackage: OPENCLAW_CLI.packageName
  } as const;
}
