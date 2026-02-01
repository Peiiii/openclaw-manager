import { Hono } from "hono";
import { cors } from "hono/cors";

import { serveStaticFile } from "./lib/static.js";
import { createAuthMiddleware } from "./middlewares/auth.js";
import { registerRoutes } from "./routes/index.js";
import type { ApiDeps } from "./deps.js";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5179",
  "http://127.0.0.1:5179"
];

type AppOptions = {
  corsOrigins: string[];
  webDist?: string | null;
};

export function createApp(deps: ApiDeps, options: AppOptions) {
  const app = new Hono();
  const allowed = new Set([...DEFAULT_CORS_ORIGINS, ...options.corsOrigins]);

  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return "*";
        if (allowed.has("*")) return origin;
        if (allowed.has(origin)) return origin;
        return "null";
      },
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true
    })
  );

  app.use("/api/*", createAuthMiddleware(deps));

  registerRoutes(app, deps);

  if (options.webDist) {
    app.get("*", async (c) => {
      const reqPath = c.req.path;
      if (reqPath.startsWith("/api") || reqPath === "/health") {
        return c.notFound();
      }
      return serveStaticFile(c.req.path, options.webDist ?? "");
    });
  }

  return app;
}
