import os from "node:os";
import path from "node:path";

export const REQUIRED_NODE_MAJOR = 22;
export const DEFAULT_GATEWAY_HOST = "127.0.0.1";
export const DEFAULT_GATEWAY_PORT = 18789;
export const DEFAULT_API_HOST = "127.0.0.1";
export const DEFAULT_API_PORT = 17321;
export const DEFAULT_CONFIG_PATH = path.join(os.homedir(), ".clawdbot-manager", "config.json");
export const ONBOARDING_CACHE_MS = 5000;
