import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";

import { getDefaultAuthCredentials } from "./auth-defaults.js";
import { resolveConfigPath } from "./config.js";

const SESSION_COOKIE_NAME = "openclaw_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_CLOCK_SKEW_MS = 1000 * 60 * 5;

type ManagerConfig = {
  auth?: {
    username: string;
    salt: string;
    hash: string;
  };
};

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionTtlSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}

export function resolveSessionSecret(authDisabled: boolean): string | null {
  if (authDisabled) return null;
  const envSecret = process.env.MANAGER_AUTH_SESSION_SECRET?.trim();
  if (envSecret) return envSecret;
  const envUser = process.env.MANAGER_AUTH_USERNAME?.trim() ?? "";
  const envPass = process.env.MANAGER_AUTH_PASSWORD ?? "";
  if (envUser && envPass) return `${envUser}:${envPass}`;

  const config = loadManagerConfig();
  const auth = config?.auth;
  if (!auth?.username || !auth?.salt || !auth?.hash) {
    const defaults = getDefaultAuthCredentials();
    return `${defaults.username}:${defaults.password}`;
  }
  return `${auth.username}:${auth.salt}:${auth.hash}`;
}

export function createSessionToken(username: string, secret: string, now = Date.now()) {
  const issuedAt = now;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${username}.${issuedAt}.${nonce}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 4) return { ok: false as const };
  const [username, issuedAtRaw, nonce, signature] = parts;
  if (!username || !issuedAtRaw || !nonce || !signature) return { ok: false as const };
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return { ok: false as const };
  if (issuedAt - now > SESSION_CLOCK_SKEW_MS) return { ok: false as const };
  if (now - issuedAt > SESSION_TTL_MS) return { ok: false as const };
  const payload = `${username}.${issuedAt}.${nonce}`;
  const expected = signPayload(payload, secret);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { ok: false as const };
  }
  return { ok: true as const, username };
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
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
