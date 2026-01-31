#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const cmd = args.find((arg) => !arg.startsWith("-")) ?? "start";

if (args.includes("-h") || args.includes("--help") || cmd === "help") {
  printHelp();
  process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
  console.log("openclaw-manager 0.1.0");
  process.exit(0);
}

if (cmd !== "start") {
  console.error(`[manager] Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

void start();

async function start() {
  const apiPort = process.env.MANAGER_API_PORT ?? "17321";
  const apiHost = process.env.MANAGER_API_HOST ?? "0.0.0.0";
  const configDir = process.env.MANAGER_CONFIG_DIR ?? path.join(os.homedir(), ".openclaw-manager");
  const configPath =
    process.env.MANAGER_CONFIG_PATH ?? path.join(configDir, "config.json");
  const logPath =
    process.env.MANAGER_LOG_PATH ?? path.join(configDir, "openclaw-manager.log");
  const errorLogPath =
    process.env.MANAGER_ERROR_LOG_PATH ??
    path.join(configDir, "openclaw-manager.error.log");
  const pidPath = path.join(configDir, "manager.pid");

  ensureDir(configDir);
  ensureDir(path.dirname(logPath));
  ensureDir(path.dirname(errorLogPath));

  if (isRunning(pidPath)) {
    const pid = fs.readFileSync(pidPath, "utf-8").trim();
    console.log(`[manager] Already running (pid: ${pid}).`);
    return;
  }

  if (!fs.existsSync(configPath)) {
    const username =
      process.env.MANAGER_ADMIN_USER ??
      process.env.OPENCLAW_MANAGER_ADMIN_USER ??
      (await promptLine("Admin username: "));
    const password =
      process.env.MANAGER_ADMIN_PASS ??
      process.env.OPENCLAW_MANAGER_ADMIN_PASS ??
      (await promptSecret("Admin password: "));
    if (!username || !password) {
      console.error("[manager] Admin username/password is required.");
      process.exit(1);
    }
    writeAdminConfig(configPath, username, password);
  }

  const pkgRoot = resolvePackageRoot();
  const apiEntry = path.join(pkgRoot, "dist", "index.js");
  const webDist = path.join(pkgRoot, "web-dist");

  if (!fs.existsSync(apiEntry) || !fs.existsSync(webDist)) {
    console.error("[manager] Package is missing build artifacts.");
    console.error("[manager] Please reinstall or use a release that includes dist assets.");
    process.exit(1);
  }

  const out = fs.openSync(logPath, "a");
  const err = fs.openSync(errorLogPath, "a");
  const child = spawn(process.execPath, [apiEntry], {
    env: {
      ...process.env,
      MANAGER_API_HOST: apiHost,
      MANAGER_API_PORT: apiPort,
      MANAGER_WEB_DIST: webDist,
      MANAGER_CONFIG_PATH: configPath
    },
    detached: true,
    stdio: ["ignore", out, err]
  });
  child.unref();

  fs.writeFileSync(pidPath, String(child.pid), "utf-8");

  const lanIp = resolveLanIp();
  console.log(`[manager] Started (pid: ${child.pid}).`);
  console.log(`[manager] Log: ${logPath}`);
  console.log(`[manager] Error log: ${errorLogPath}`);
  console.log(`[manager] Open (local): http://localhost:${apiPort}`);
  console.log(`[manager] Open (local): http://127.0.0.1:${apiPort}`);
  if (lanIp) {
    console.log(`[manager] Open (LAN): http://${lanIp}:${apiPort}`);
  }
}

function ensureDir(dir) {
  if (!dir) return;
  fs.mkdirSync(dir, { recursive: true });
}

function isRunning(pidPath) {
  if (!fs.existsSync(pidPath)) return false;
  const raw = fs.readFileSync(pidPath, "utf-8").trim();
  const pid = Number(raw);
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function writeAdminConfig(configPath, username, password) {
  const salt = randomBytes(16).toString("base64");
  const hash = scryptSync(password, salt, 64).toString("base64");
  const payload = {
    auth: {
      username,
      salt,
      hash
    },
    createdAt: new Date().toISOString()
  };
  ensureDir(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));
  console.log(`[manager] Admin config saved to ${configPath}`);
}

async function promptLine(prompt) {
  if (!process.stdin.isTTY) return "";
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(prompt, resolve));
  rl.close();
  return String(answer).trim();
}

async function promptSecret(prompt) {
  if (!process.stdin.isTTY) return "";
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let value = "";
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    const onData = (data) => {
      const char = data.toString();
      if (char === "\n" || char === "\r") {
        stdout.write("\n");
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        resolve(value.trim());
        return;
      }
      if (char === "\u0003") {
        process.exit(1);
      }
      value += char;
    };
    stdin.on("data", onData);
  });
}

function resolveLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

function resolvePackageRoot() {
  const filePath = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(filePath), "..");
}

function printHelp() {
  console.log(`openclaw-manager\n\nUsage:\n  openclaw-manager start\n\nOptions:\n  -h, --help     Show help\n  -v, --version  Show version\n`);
}
