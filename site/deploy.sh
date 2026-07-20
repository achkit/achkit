#!/usr/bin/env bash
# achkit.com deploy: sync, build (full Node preset), restart pm2, health-check.
set -euo pipefail

APP_DIR=/opt/achkit-site
PORT=3210
HOST=127.0.0.1

cd "$APP_DIR"
git fetch --quiet origin
git reset --hard origin/main
cd site
npm ci --no-audit --no-fund
NITRO_PRESET=node-server npm run build

# startOrReload re-reads ecosystem.config.cjs (and its .env) so env changes land.
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

sleep 2
if curl -fsS "http://127.0.0.1:${PORT}/api/__health" >/dev/null; then
  echo "deploy ok: achkit-site healthy on ${HOST}:${PORT}"
else
  echo "deploy WARN: health check failed" >&2
  exit 1
fi
