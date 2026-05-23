#!/usr/bin/env bash

set -euo pipefail

APP_NAME="${APP_NAME:-resume-tool}"
APP_PORT="${APP_PORT:-3010}"
APP_BASE_PATH_RAW="${APP_BASE_PATH:-/resume-tool}"
APP_PUBLIC_NAME="${APP_PUBLIC_NAME:-AI求职简历决策助手}"
APP_DOMAIN="${APP_DOMAIN:-}"
APP_URL="${APP_URL:-}"
NODE_VERSION="${NODE_VERSION:-20.19.5}"
NGINX_SERVER_CONF="${NGINX_SERVER_CONF:-}"
ARTIFACT_FILE="${ARTIFACT_FILE:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
WEB_DIR="${WEB_DIR:-${REPO_ROOT}/web}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/${APP_NAME}}"
APP_DIR="${APP_DIR:-${DEPLOY_ROOT}/app}"
RUNTIME_DIR="${DEPLOY_ROOT}/runtime"
CONFIG_DIR="${DEPLOY_ROOT}/config"
STATE_DIR="${STATE_DIR:-/var/lib/${APP_NAME}}"
TASK_DATA_DIR="${TASK_DATA_DIR:-${STATE_DIR}/tasks}"
ENV_FILE="${ENV_FILE:-${CONFIG_DIR}/${APP_NAME}.env}"
SERVICE_NAME="${SERVICE_NAME:-${APP_NAME}}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NGINX_SNIPPET_DIR="${NGINX_SNIPPET_DIR:-/etc/nginx/snippets}"
NGINX_SNIPPET_FILE="${NGINX_SNIPPET_DIR}/${APP_NAME}.conf"

read_existing_env_value() {
  local key="$1"

  [[ -f "$ENV_FILE" ]] || return 0
  grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d= -f2-
}

log() {
  printf '\n[%s] %s\n' "$APP_NAME" "$1"
}

fail() {
  printf '\n[%s] ERROR: %s\n' "$APP_NAME" "$1" >&2
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

if [[ -z "$APP_BASE_PATH" ]]; then
  fail "APP_BASE_PATH 不能为空；同域名部署场景请至少设置为 /resume-tool 这类子路径。"
fi

if [[ -z "$APP_URL" ]]; then
  [[ -n "$APP_DOMAIN" ]] || fail "请提供 APP_DOMAIN 或直接提供 APP_URL。"
  APP_URL="https://${APP_DOMAIN}${APP_BASE_PATH}"
fi

[[ -n "$NGINX_SERVER_CONF" ]] || fail "请通过 NGINX_SERVER_CONF 指定 ai radar 当前站点的 nginx server 配置文件路径。"
[[ -f "$NGINX_SERVER_CONF" ]] || fail "NGINX_SERVER_CONF 不存在：${NGINX_SERVER_CONF}"

if [[ -z "$ARTIFACT_FILE" ]]; then
  ARTIFACT_FILE="${REPO_ROOT}/dist/${APP_NAME}-prebuilt.tar.gz"
fi

[[ -f "$ARTIFACT_FILE" ]] || fail "未找到预构建部署包：${ARTIFACT_FILE}"

if [[ "$EUID" -ne 0 ]]; then
  fail "请使用 root 或 sudo 运行该脚本。"
fi

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64)
      printf 'x64'
      ;;
    aarch64|arm64)
      printf 'arm64'
      ;;
    *)
      fail "暂不支持的 CPU 架构：$(uname -m)"
      ;;
  esac
}

install_system_packages() {
  local packages=(curl tar xz-utils rsync nginx)
  local missing=()

  for package in "${packages[@]}"; do
    if ! command -v "${package%%-*}" >/dev/null 2>&1 && ! command -v "$package" >/dev/null 2>&1; then
      missing+=("$package")
    fi
  done

  [[ ${#missing[@]} -eq 0 ]] && return

  if command -v apt-get >/dev/null 2>&1; then
    log "安装系统依赖: ${missing[*]}"
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y "${missing[@]}"
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    log "安装系统依赖: ${missing[*]}"
    dnf install -y curl tar xz rsync nginx
    return
  fi

  if command -v yum >/dev/null 2>&1; then
    log "安装系统依赖: ${missing[*]}"
    yum install -y curl tar xz rsync nginx
    return
  fi

  fail "无法自动安装依赖，请先手动安装: ${missing[*]}"
}

install_node_runtime() {
  local arch archive node_root url tmp_dir
  arch="$(detect_arch)"
  node_root="${RUNTIME_DIR}/node-v${NODE_VERSION}-linux-${arch}"

  if [[ -x "${node_root}/bin/node" ]]; then
    log "复用现有 Node.js 运行时 ${NODE_VERSION}"
    NODE_BIN="${node_root}/bin"
    return
  fi

  archive="node-v${NODE_VERSION}-linux-${arch}.tar.xz"
  url="https://nodejs.org/dist/v${NODE_VERSION}/${archive}"
  tmp_dir="$(mktemp -d)"

  log "下载独立 Node.js 运行时 ${NODE_VERSION}"
  mkdir -p "$RUNTIME_DIR"
  curl -fsSL "$url" -o "${tmp_dir}/${archive}"
  tar -xJf "${tmp_dir}/${archive}" -C "$RUNTIME_DIR"
  rm -rf "$tmp_dir"

  NODE_BIN="${node_root}/bin"
}

write_env_file() {
  local existing_app_name existing_app_url existing_base_path existing_task_data_dir
  local existing_api_base existing_api_key existing_api_model existing_api_path

  existing_app_name="$(read_existing_env_value NEXT_PUBLIC_APP_NAME)"
  existing_app_url="$(read_existing_env_value NEXT_PUBLIC_APP_URL)"
  existing_base_path="$(read_existing_env_value NEXT_PUBLIC_APP_BASE_PATH)"
  existing_task_data_dir="$(read_existing_env_value TASK_DATA_DIR)"
  existing_api_base="$(read_existing_env_value ANALYSIS_API_BASE_URL)"
  existing_api_key="$(read_existing_env_value ANALYSIS_API_KEY)"
  existing_api_model="$(read_existing_env_value ANALYSIS_API_MODEL)"
  existing_api_path="$(read_existing_env_value ANALYSIS_API_PATH)"

  mkdir -p "$CONFIG_DIR" "$TASK_DATA_DIR"

  log "写入部署环境文件 ${ENV_FILE}"
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=${APP_PORT}
NEXT_PUBLIC_APP_NAME=${APP_PUBLIC_NAME:-${existing_app_name}}
NEXT_PUBLIC_APP_URL=${APP_URL:-${existing_app_url}}
NEXT_PUBLIC_APP_BASE_PATH=${APP_BASE_PATH:-${existing_base_path}}
TASK_DATA_DIR=${TASK_DATA_DIR:-${existing_task_data_dir}}
ANALYSIS_API_BASE_URL=${ANALYSIS_API_BASE_URL:-${existing_api_base}}
ANALYSIS_API_KEY=${ANALYSIS_API_KEY:-${existing_api_key}}
ANALYSIS_API_MODEL=${ANALYSIS_API_MODEL:-${existing_api_model}}
ANALYSIS_API_PATH=${ANALYSIS_API_PATH:-${existing_api_path:-/chat/completions}}
EOF
}

install_prebuilt_bundle() {
  log "解压预构建部署包 ${ARTIFACT_FILE}"
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR"
  tar -xzf "$ARTIFACT_FILE" -C "$APP_DIR"

  [[ -f "${APP_DIR}/server.js" ]] || fail "部署包缺少 server.js：${APP_DIR}/server.js"
}

write_systemd_service() {
  log "写入 systemd 服务 ${SERVICE_FILE}"
  cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=${APP_PUBLIC_NAME}
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=${NODE_BIN}/node ${APP_DIR}/server.js
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now "$SERVICE_NAME"
  systemctl restart "$SERVICE_NAME"
}

write_nginx_snippet() {
  log "生成 nginx 子路径反向代理片段 ${NGINX_SNIPPET_FILE}"
  mkdir -p "$NGINX_SNIPPET_DIR"

  cat > "$NGINX_SNIPPET_FILE" <<EOF
location = ${APP_BASE_PATH} {
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_pass http://127.0.0.1:${APP_PORT};
}

location ^~ ${APP_BASE_PATH}/ {
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://127.0.0.1:${APP_PORT};
}
EOF
}

attach_nginx_snippet() {
  local include_line backup_file insert_line
  include_line="    include ${NGINX_SNIPPET_FILE};"

  if grep -Fq "$NGINX_SNIPPET_FILE" "$NGINX_SERVER_CONF"; then
    log "nginx 主站配置已包含部署片段"
    return
  fi

  insert_line="$(grep -n '^[[:space:]]*}[[:space:]]*$' "$NGINX_SERVER_CONF" | tail -n1 | cut -d: -f1)"
  [[ -n "$insert_line" ]] || fail "无法在 ${NGINX_SERVER_CONF} 中定位 server 结尾大括号。"

  backup_file="${NGINX_SERVER_CONF}.bak.$(date +%Y%m%d%H%M%S)"
  cp "$NGINX_SERVER_CONF" "$backup_file"
  sed -i "${insert_line}i\\${include_line}" "$NGINX_SERVER_CONF"

  if ! nginx -t; then
    cp "$backup_file" "$NGINX_SERVER_CONF"
    nginx -t || true
    fail "nginx 配置校验失败，已恢复备份：${backup_file}"
  fi

  systemctl reload nginx
}

print_summary() {
  cat <<EOF

部署完成。

- 访问地址: ${APP_URL}
- 子路径: ${APP_BASE_PATH}
- 本地端口: 127.0.0.1:${APP_PORT}
- systemd 服务: ${SERVICE_NAME}
- 任务数据目录: ${TASK_DATA_DIR}
- 应用目录: ${APP_DIR}
- 预构建包: ${ARTIFACT_FILE}
- nginx 主站配置: ${NGINX_SERVER_CONF}
- nginx 片段: ${NGINX_SNIPPET_FILE}

后续更新时，先重新生成并上传预构建包，再在服务器执行：
  sudo APP_DOMAIN=${APP_DOMAIN:-example.com} NGINX_SERVER_CONF=${NGINX_SERVER_CONF} ARTIFACT_FILE=${ARTIFACT_FILE} ${SCRIPT_DIR}/deploy.sh
EOF
}

install_system_packages
install_node_runtime
write_env_file
install_prebuilt_bundle
write_systemd_service
write_nginx_snippet
attach_nginx_snippet
print_summary