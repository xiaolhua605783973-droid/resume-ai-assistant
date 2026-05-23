#!/usr/bin/env bash

set -euo pipefail

APP_NAME="${APP_NAME:-resume-tool}"
APP_BASE_PATH_RAW="${APP_BASE_PATH:-/resume-tool}"
APP_URL="${APP_URL:-}"
NODE_BIN_DIR="${NODE_BIN_DIR:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
WEB_DIR="${WEB_DIR:-${REPO_ROOT}/web}"
DIST_DIR="${DIST_DIR:-${REPO_ROOT}/dist}"
STAGING_DIR="${DIST_DIR}/${APP_NAME}"
ARTIFACT_FILE="${ARTIFACT_FILE:-${DIST_DIR}/${APP_NAME}-prebuilt.tar.gz}"

log() {
  printf '\n[%s-package] %s\n' "$APP_NAME" "$1"
}

fail() {
  printf '\n[%s-package] ERROR: %s\n' "$APP_NAME" "$1" >&2
  exit 1
}

normalize_base_path() {
  local raw="$1"

  if [[ -z "$raw" || "$raw" == "/" ]]; then
    printf ''
    return
  fi

  raw="/${raw#/}"
  printf '%s' "${raw%/}"
}

APP_BASE_PATH="$(normalize_base_path "$APP_BASE_PATH_RAW")"

[[ -f "${WEB_DIR}/package.json" ]] || fail "未找到 web/package.json：${WEB_DIR}"

if [[ -z "$APP_BASE_PATH" ]]; then
  fail "APP_BASE_PATH 不能为空；预构建包必须和部署子路径一致。"
fi

if [[ -z "$APP_URL" ]]; then
  APP_URL="https://example.com${APP_BASE_PATH}"
fi

if [[ -z "$NODE_BIN_DIR" ]]; then
  if [[ -x "${REPO_ROOT}/.tools/node/bin/node" ]]; then
    NODE_BIN_DIR="${REPO_ROOT}/.tools/node/bin"
  else
    NODE_BIN_DIR=""
  fi
fi

mkdir -p "$DIST_DIR"
rm -rf "$STAGING_DIR"

log "安装依赖并构建 standalone 产物"
cd "$WEB_DIR"

if [[ -n "$NODE_BIN_DIR" ]]; then
  export PATH="${NODE_BIN_DIR}:$PATH"
fi

NEXT_PUBLIC_APP_BASE_PATH="$APP_BASE_PATH" \
NEXT_PUBLIC_APP_URL="$APP_URL" \
TASK_DATA_DIR=/tmp/${APP_NAME}-tasks \
npm ci --include=dev

NEXT_PUBLIC_APP_BASE_PATH="$APP_BASE_PATH" \
NEXT_PUBLIC_APP_URL="$APP_URL" \
TASK_DATA_DIR=/tmp/${APP_NAME}-tasks \
npm run build

[[ -d .next/standalone ]] || fail "构建完成，但未找到 .next/standalone 产物。"

log "组装部署包"
mkdir -p "${STAGING_DIR}/.next"
rsync -a .next/standalone/ "$STAGING_DIR/"
rsync -a .next/static/ "${STAGING_DIR}/.next/static/"

if [[ -d public ]]; then
  rsync -a public/ "${STAGING_DIR}/public/"
fi

cat > "${STAGING_DIR}/DEPLOY_METADATA" <<EOF
APP_NAME=${APP_NAME}
APP_BASE_PATH=${APP_BASE_PATH}
APP_URL=${APP_URL}
BUILT_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

log "写入压缩包 ${ARTIFACT_FILE}"
rm -f "$ARTIFACT_FILE"
tar -C "$STAGING_DIR" -czf "$ARTIFACT_FILE" .

printf '\n预构建包已生成：%s\n' "$ARTIFACT_FILE"