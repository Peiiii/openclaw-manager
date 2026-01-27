import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type CommandRunner = (
  cmd: string,
  args: string[],
  timeoutMs: number,
  env?: NodeJS.ProcessEnv
) => Promise<string>;

export function createCommandRunner(repoRoot: string): CommandRunner {
  return (cmd, args, timeoutMs, env = process.env) =>
    runCommand(cmd, args, timeoutMs, { cwd: repoRoot, env });
}

export function findOnPath(binary: string): string | null {
  const envPath = process.env.PATH ?? "";
  const entries = envPath.split(path.delimiter).filter(Boolean);

  for (const entry of entries) {
    const candidate = path.join(entry, binary);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

type StreamCommandOptions = {
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  onLog: (line: string) => void;
};

export function runCommandWithLogs(
  cmd: string,
  args: string[],
  options: StreamCommandOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: options.env
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    const flushLines = (buffer: string, prefix?: string) => {
      const lines = buffer.split(/\r?\n/);
      const rest = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed) {
          options.onLog(prefix ? `${prefix}${trimmed}` : trimmed);
        }
      }
      return rest;
    };

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("timeout"));
    }, options.timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      stdoutBuffer = flushLines(stdoutBuffer);
    });

    child.stderr?.on("data", (chunk) => {
      stderrBuffer += chunk.toString();
      stderrBuffer = flushLines(stderrBuffer, "stderr: ");
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (stdoutBuffer.trim()) {
        options.onLog(stdoutBuffer.trimEnd());
      }
      if (stderrBuffer.trim()) {
        options.onLog(`stderr: ${stderrBuffer.trimEnd()}`);
      }
      if (code === 0) resolve();
      else reject(new Error(`exit ${code ?? "unknown"}`));
    });
  });
}

function runCommand(
  cmd: string,
  args: string[],
  timeoutMs: number,
  options: { cwd: string; env: NodeJS.ProcessEnv }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: options.env
    });

    let output = "";
    let error = "";

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("timeout"));
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      error += chunk.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(output);
      else reject(new Error(error || output));
    });
  });
}
