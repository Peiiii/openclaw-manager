import { serve } from "@hono/node-server";

import { createApp } from "./app.js";
import { DEFAULT_API_HOST, DEFAULT_API_PORT } from "./lib/constants.js";
import { resolveRepoRoot, resolveWebDist } from "./lib/config.js";
import { buildCommandRegistry, createProcessManager } from "./lib/commands.js";
import { createCommandRunner } from "./lib/runner.js";
import { parseOrigins, parsePort } from "./lib/utils.js";
import type { ApiDeps } from "./deps.js";

const repoRoot = resolveRepoRoot();
const webDist = resolveWebDist(repoRoot);
const commandRegistry = buildCommandRegistry(repoRoot);
const processManager = createProcessManager(commandRegistry);
const runCommand = createCommandRunner(repoRoot);

const deps: ApiDeps = {
  repoRoot,
  runCommand,
  commandRegistry,
  processManager,
  auth: {
    disabled: process.env.MANAGER_AUTH_DISABLED === "1",
    allowUnconfigured: process.env.MANAGER_AUTH_ALLOW_UNCONFIGURED === "1"
  }
};

const host =
  process.env.MANAGER_API_HOST ?? process.env.ONBOARDING_API_HOST ?? DEFAULT_API_HOST;
const port =
  parsePort(process.env.MANAGER_API_PORT ?? process.env.ONBOARDING_API_PORT) ??
  DEFAULT_API_PORT;

const app = createApp(deps, {
  corsOrigins: parseOrigins(process.env.MANAGER_CORS_ORIGIN),
  webDist
});

serve({
  fetch: app.fetch,
  hostname: host,
  port
});
