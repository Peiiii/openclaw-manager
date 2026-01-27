import type { CommandDefinition, ProcessSnapshot } from "./lib/commands.js";
import type { CommandRunner } from "./lib/runner.js";

export type ProcessManager = {
  listProcesses: () => ProcessSnapshot[];
  startProcess: (id: string) => { ok: boolean; error?: string; process?: ProcessSnapshot };
  stopProcess: (id: string) => { ok: boolean; error?: string; process?: ProcessSnapshot };
};

export type ApiDeps = {
  repoRoot: string;
  runCommand: CommandRunner;
  commandRegistry: CommandDefinition[];
  processManager: ProcessManager;
  auth: {
    disabled: boolean;
    allowUnconfigured: boolean;
  };
};
