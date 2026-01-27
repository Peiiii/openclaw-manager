import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_CONFIG_PATH } from "./constants.js";

export function resolveRepoRoot(): string {
  const envRoot = process.env.MANAGER_REPO_ROOT ?? process.env.ONBOARDING_REPO_ROOT;
  if (envRoot) return path.resolve(envRoot);

  const startPoints = [process.cwd(), path.dirname(fileURLToPath(import.meta.url))];

  for (const start of startPoints) {
    const found = findRepoRoot(start);
    if (found) return found;
  }

  return path.resolve(process.cwd(), "../..");
}

export function resolveWebDist(root: string) {
  const candidate = process.env.MANAGER_WEB_DIST ?? path.join(root, "apps/web/dist");
  const indexPath = path.join(candidate, "index.html");
  if (fs.existsSync(indexPath)) return candidate;
  return null;
}

export function resolveConfigPath() {
  return process.env.MANAGER_CONFIG_PATH ?? DEFAULT_CONFIG_PATH;
}

function findRepoRoot(start: string): string | null {
  let current = start;
  for (let i = 0; i < 6; i += 1) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, "utf-8");
        const parsed = JSON.parse(raw) as { name?: string };
        if (parsed.name === "clawdbot-manager") return current;
      } catch {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}
