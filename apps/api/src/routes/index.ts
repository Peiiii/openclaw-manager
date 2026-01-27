import type { Hono } from "hono";

import type { ApiDeps } from "../deps.js";
import { registerAuthRoutes } from "./auth.js";
import { registerCliRoutes } from "./cli.js";
import { registerDiscordRoutes } from "./discord.js";
import { registerHealthRoutes } from "./health.js";
import { registerProcessRoutes } from "./processes.js";
import { registerQuickstartRoutes } from "./quickstart.js";
import { registerStatusRoutes } from "./status.js";

export function registerRoutes(app: Hono, deps: ApiDeps) {
  registerHealthRoutes(app);
  registerAuthRoutes(app, deps);
  registerStatusRoutes(app, deps);
  registerProcessRoutes(app, deps);
  registerCliRoutes(app, deps);
  registerDiscordRoutes(app, deps);
  registerQuickstartRoutes(app, deps);
}
