import { scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";

import { getDefaultAuthCredentials } from "./auth-defaults.js";
import { resolveConfigPath } from "./config.js";

export type AuthState = {
  configured: boolean;
  verify: (username: string, password: string) => boolean;
};

type ManagerConfig = {
  auth?: {
    username: string;
    salt: string;
    hash: string;
  };
  createdAt?: string;
};

export function resolveAuthState(authDisabled: boolean): AuthState {
  if (authDisabled) {
    return { configured: false, verify: () => true };
  }

  const envUser = process.env.MANAGER_AUTH_USERNAME?.trim() ?? "";
  const envPass = process.env.MANAGER_AUTH_PASSWORD ?? "";
  if (envUser && envPass) {
    return {
      configured: true,
      verify: (username, password) => username === envUser && password === envPass
    };
  }

  const config = loadManagerConfig();
  const auth = config?.auth;
  if (!auth?.username || !auth?.salt || !auth?.hash) {
    const defaults = getDefaultAuthCredentials();
    return {
      configured: true,
      verify: (username, password) =>
        username === defaults.username && password === defaults.password
    };
  }

  return {
    configured: true,
    verify: (username, password) => verifyPassword(username, password, auth)
  };
}

export function verifyAuthHeader(header: string, authState: AuthState) {
  const match = header.match(/^Basic\s+(.+)$/i);
  if (!match) return false;
  const decoded = Buffer.from(match[1], "base64").toString("utf-8");
  const [username, ...rest] = decoded.split(":");
  const password = rest.join(":");
  if (!username || !password) return false;
  return authState.verify(username, password);
}

function verifyPassword(
  username: string,
  password: string,
  auth: { username: string; salt: string; hash: string }
) {
  if (username !== auth.username) return false;
  const hashed = scryptSync(password, auth.salt, 64);
  const expected = Buffer.from(auth.hash, "base64");
  if (hashed.length !== expected.length) return false;
  return timingSafeEqual(hashed, expected);
}

function loadManagerConfig(): ManagerConfig | null {
  const configPath = resolveConfigPath();
  try {
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as ManagerConfig;
  } catch {
    return null;
  }
}
