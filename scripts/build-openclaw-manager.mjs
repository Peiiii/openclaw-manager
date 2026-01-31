import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDist = path.join(repoRoot, "apps", "api", "dist");
const webDist = path.join(repoRoot, "apps", "web", "dist");
const pkgDir = path.join(repoRoot, "packages", "cli");
const targetApi = path.join(pkgDir, "dist");
const targetWeb = path.join(pkgDir, "web-dist");

if (!fs.existsSync(apiDist) || !fs.existsSync(webDist)) {
  console.error("[build-openclaw-manager] Missing build artifacts. Run pnpm build first.");
  process.exit(1);
}

fs.rmSync(targetApi, { recursive: true, force: true });
fs.rmSync(targetWeb, { recursive: true, force: true });

fs.cpSync(apiDist, targetApi, { recursive: true });
fs.cpSync(webDist, targetWeb, { recursive: true });

console.log("[build-openclaw-manager] Copied api dist and web dist into package.");
