#!/usr/bin/env bash

set -euo pipefail

APP_NAME="${APP_NAME:-resume-tool}"
APP_DOMAIN="${APP_DOMAIN:-}"
APP_BASE_PATH_RAW="${APP_BASE_PATH:-/resume-tool}"
APP_PORT="${APP_PORT:-3010}"
APP_URL="${APP_URL:-}"
APP_PUBLIC_NAME="${APP_PUBLIC_NAME:-AI求职简历决策助手}"
ANALYSIS_API_BASE_URL="${ANALYSIS_API_BASE_URL:-}"
ANALYSIS_API_KEY="${ANALYSIS_API_KEY:-}"
ANALYSIS_API_MODEL="${ANALYSIS_API_MODEL:-}"
ANALYSIS_API_PATH="${ANALYSIS_API_PATH:-/chat/completions}"
NGINX_SERVER_CONF="${NGINX_SERVER_CONF:-}"

SSH_USER="${SSH_USER:-root}"
SSH_HOST="${SSH_HOST:-}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"

REMOTE_REPO_DIR="${REMOTE_REPO_DIR:-/home/admin/resume-ai-assistant}"
REMOTE_ARTIFACT_DIR="${REMOTE_ARTIFACT_DIR:-${REMOTE_REPO_DIR}/dist}"
REMOTE_DEPLOY_SCRIPT="${REMOTE_DEPLOY_SCRIPT:-${REMOTE_REPO_DIR}/deploy/alicloud/deploy.sh}"
ARTIFACT_FILE="${ARTIFACT_FILE:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"

log() {
  printf '\n[%s-local-deploy] %s\n' "$APP_NAME" "$1"
}

fail() {
  printf '\n[%s-local-deploy] ERROR: %s\n' "$APP_NAME" "$1" >&2
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

shell_escape() {
  printf '%q' "$1"
}

APP_BASE_PATH="$(normalize_base_path "$APP_BASE_PATH_RAW")"

[[ -n "$SSH_HOST" ]] || fail "请提供 SSH_HOST。"
[[ -n "$APP_DOMAIN" || -n "$APP_URL" ]] || fail "请提供 APP_DOMAIN 或 APP_URL。"
[[ -n "$NGINX_SERVER_CONF" ]] || fail "请提供 NGINX_SERVER_CONF。"

if [[ -z "$APP_BASE_PATH" ]]; then
  fail "APP_BASE_PATH 不能为空；同域名部署场景请至少设置为 /resume-tool。"
fi

if [[ -z "$APP_URL" ]]; then
  APP_URL="http://${APP_DOMAIN}${APP_BASE_PATH}"
fi

if [[ -z "$ARTIFACT_FILE" ]]; then
  ARTIFACT_FILE="${REPO_ROOT}/dist/${APP_NAME}-prebuilt.tar.gz"
fi

SSH_ARGS=( -p "$SSH_PORT" )
SCP_ARGS=( -P "$SSH_PORT" )

if [[ -n "$SSH_KEY_PATH" ]]; then
  [[ -f "$SSH_KEY_PATH" ]] || fail "SSH_KEY_PATH 不存在：${SSH_KEY_PATH}"
  SSH_ARGS+=( -i "$SSH_KEY_PATH" )
  SCP_ARGS+=( -i "$SSH_KEY_PATH" )
fi

REMOTE_TARGET="${SSH_USER}@${SSH_HOST}"

log "本地生成预构建部署包"
APP_NAME="$APP_NAME" \
APP_BASE_PATH="$APP_BASE_PATH" \
APP_URL="$APP_URL" \
ARTIFACT_FILE="$ARTIFACT_FILE" \
bash "${SCRIPT_DIR}/package.sh"

[[ -f "$ARTIFACT_FILE" ]] || fail "未生成部署包：${ARTIFACT_FILE}"

log "创建远程部署目录"
ssh "${SSH_ARGS[@]}" "$REMOTE_TARGET" \
  "mkdir -p $(shell_escape "$REMOTE_ARTIFACT_DIR") $(shell_escape "$(dirname "$REMOTE_DEPLOY_SCRIPT")")"

log "上传最新部署脚本"
scp "${SCP_ARGS[@]}" "${SCRIPT_DIR}/deploy.sh" "$REMOTE_TARGET:${REMOTE_DEPLOY_SCRIPT}"

log "上传预构建部署包"
scp "${SCP_ARGS[@]}" "$ARTIFACT_FILE" "$REMOTE_TARGET:${REMOTE_ARTIFACT_DIR}/"

REMOTE_ARTIFACT_FILE="${REMOTE_ARTIFACT_DIR}/$(basename "$ARTIFACT_FILE")"

log "在远程服务器执行部署"
ssh "${SSH_ARGS[@]}" "$REMOTE_TARGET" "\
APP_NAME=$(shell_escape "$APP_NAME") \
APP_DOMAIN=$(shell_escape "$APP_DOMAIN") \
APP_BASE_PATH=$(shell_escape "$APP_BASE_PATH") \
APP_PORT=$(shell_escape "$APP_PORT") \
APP_URL=$(shell_escape "$APP_URL") \
APP_PUBLIC_NAME=$(shell_escape "$APP_PUBLIC_NAME") \
NGINX_SERVER_CONF=$(shell_escape "$NGINX_SERVER_CONF") \
ARTIFACT_FILE=$(shell_escape "$REMOTE_ARTIFACT_FILE") \
ANALYSIS_API_BASE_URL=$(shell_escape "$ANALYSIS_API_BASE_URL") \
ANALYSIS_API_KEY=$(shell_escape "$ANALYSIS_API_KEY") \
ANALYSIS_API_MODEL=$(shell_escape "$ANALYSIS_API_MODEL") \
ANALYSIS_API_PATH=$(shell_escape "$ANALYSIS_API_PATH") \
bash $(shell_escape "$REMOTE_DEPLOY_SCRIPT")"

printf '\n部署命令已执行完成。访问地址：%s\n' "$APP_URL"