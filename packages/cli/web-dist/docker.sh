#!/usr/bin/env bash
set -euo pipefail

NAME="${MANAGER_DOCKER_NAME:-openclaw-manager}"
PORT="${MANAGER_API_PORT:-17321}"
ADMIN_USER="${MANAGER_ADMIN_USER:-admin}"
ADMIN_PASS="${MANAGER_ADMIN_PASS:-pass}"
REPO_URL="${MANAGER_REPO_URL:-https://github.com/Peiiii/openclaw-manager.git}"
VOLUME="${MANAGER_CONFIG_VOLUME:-openclaw-manager-config}"
GATEWAY_TIMEOUT_MS="${MANAGER_GATEWAY_TIMEOUT_MS:-}"

EXTRA_ENV=()
if [[ -n "$GATEWAY_TIMEOUT_MS" ]]; then
  EXTRA_ENV+=("-e" "MANAGER_GATEWAY_TIMEOUT_MS=$GATEWAY_TIMEOUT_MS")
fi

docker rm -f "$NAME" 2>/dev/null || true
docker volume create "$VOLUME" >/dev/null

docker run -d --name "$NAME" -p "${PORT}:${PORT}" \
  -e MANAGER_ADMIN_USER="$ADMIN_USER" \
  -e MANAGER_ADMIN_PASS="$ADMIN_PASS" \
  -e MANAGER_API_HOST=0.0.0.0 \
  -e MANAGER_API_PORT="$PORT" \
  -e MANAGER_WEB_DIST=/opt/openclaw-manager/apps/web/dist \
  -e MANAGER_CONFIG_PATH=/etc/clawdbot-manager/config.json \
  "${EXTRA_ENV[@]}" \
  -v "$VOLUME":/etc/clawdbot-manager \
  node:22-bullseye bash -lc "set -euo pipefail; \
  REPO_URL=\"$REPO_URL\"; \
  apt-get update -y >/dev/null; \
  apt-get install -y --no-install-recommends git curl ca-certificates >/dev/null; \
  corepack enable; corepack prepare pnpm@10.23.0 --activate; \
  git clone \"$REPO_URL\" /opt/openclaw-manager; \
  cd /opt/openclaw-manager; \
  CI=true pnpm install >/dev/null; pnpm build >/dev/null; \
  node apps/api/scripts/create-admin.mjs --username \"\$MANAGER_ADMIN_USER\" --password \"\$MANAGER_ADMIN_PASS\" --config /etc/clawdbot-manager/config.json; \
  exec node /opt/openclaw-manager/apps/api/dist/index.js"

if command -v curl >/dev/null 2>&1; then
  for _ in {1..120}; do
    if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
else
  echo "[manager] curl not found; skip readiness check."
fi

PUBLIC_HOST="${MANAGER_PUBLIC_HOST:-}"
if [[ -z "$PUBLIC_HOST" ]] && command -v curl >/dev/null 2>&1; then
  PUBLIC_HOST="$(curl -fsS https://api.ipify.org 2>/dev/null || true)"
fi

echo "[manager] Open (local): http://127.0.0.1:${PORT}"
if [[ -n "$PUBLIC_HOST" ]]; then
  echo "[manager] Open (public): http://${PUBLIC_HOST}:${PORT}"
else
  echo "[manager] Open (public): set MANAGER_PUBLIC_HOST to print public URL"
fi
echo "[manager] Login: ${ADMIN_USER} / ${ADMIN_PASS}"
