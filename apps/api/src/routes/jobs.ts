import type { Hono } from "hono";

import type { ApiDeps } from "../deps.js";
import {
  createCliInstallJobHandler,
  createJobStatusHandler,
  createJobStreamHandler,
  createQuickstartJobHandler
} from "../controllers/jobs.controller.js";

export function registerJobRoutes(app: Hono, deps: ApiDeps) {
  app.post("/api/jobs/cli-install", createCliInstallJobHandler(deps));
  app.post("/api/jobs/quickstart", createQuickstartJobHandler(deps));
  app.get("/api/jobs/:id", createJobStatusHandler(deps));
  app.get("/api/jobs/:id/stream", createJobStreamHandler(deps));
}
