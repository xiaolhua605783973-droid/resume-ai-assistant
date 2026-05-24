# 运维备忘录

适用对象：阿里云 ECS 上的 `ai-radar.vip/resume-tool`

## 当前线上事实

1. 线上入口：`https://ai-radar.vip/resume-tool`
2. 应用进程：`resume-tool.service`
3. 本地监听：`127.0.0.1:3010`
4. Nginx 主站配置：`/etc/nginx/sites-enabled/ai-radar`
5. Nginx 子路径片段：`/etc/nginx/snippets/resume-tool.conf`
6. 应用环境文件：`/opt/resume-tool/config/resume-tool.env`
7. 任务数据目录：`/var/lib/resume-tool/tasks`

## 常用命令

```bash
systemctl status resume-tool --no-pager -l
journalctl -u resume-tool -n 100 --no-pager
curl -I http://127.0.0.1:3010/resume-tool
curl -I https://ai-radar.vip/resume-tool
nginx -t
systemctl reload nginx
```

## 更新发布

推荐从本地仓库执行一键部署：

```bash
SSH_HOST=114.215.175.182 \
SSH_USER=root \
SSH_KEY_PATH=/path/to/your-key.pem \
APP_DOMAIN=ai-radar.vip \
APP_BASE_PATH=/resume-tool \
APP_PORT=3010 \
NGINX_SERVER_CONF=/etc/nginx/sites-enabled/ai-radar \
ANALYSIS_API_BASE_URL=https://api.deepseek.com \
ANALYSIS_API_KEY=your-key \
ANALYSIS_API_MODEL=deepseek-v4-flash \
bash deploy/alicloud/local_deploy.sh
```

如果只做服务器侧重启：

```bash
systemctl restart resume-tool
systemctl status resume-tool --no-pager -l
```

## HTTPS 证书

1. 当前证书由 `certbot` 申请。
2. 证书路径：`/etc/letsencrypt/live/ai-radar.vip/fullchain.pem`
3. 私钥路径：`/etc/letsencrypt/live/ai-radar.vip/privkey.pem`
4. 续期任务由 certbot 自动配置。

手动检查证书：

```bash
certbot certificates
curl -I https://ai-radar.vip/resume-tool
```

如需重新安装证书到 Nginx：

```bash
certbot install --cert-name ai-radar.vip
nginx -t
systemctl reload nginx
```

## Nginx 维护注意事项

1. `server_name` 必须明确写为 `ai-radar.vip www.ai-radar.vip`，不要回退成 `server_name _;`。
2. 备份文件不要放在 `/etc/nginx/sites-enabled`，否则 Nginx 会把备份也当成活动站点加载。
3. 备份建议放到 `/etc/nginx/site-backups/`。
4. 每次修改后都先执行 `nginx -t`，再 `systemctl reload nginx`。

## API Key 与环境变量

1. 如果 API key 曾经暴露，必须立刻废弃并重新生成。
2. 更新线上 key 后，重新执行部署脚本或手动更新环境文件并重启服务。
3. 当前外部分析配置写在 `/opt/resume-tool/config/resume-tool.env`。

更新环境后重启：

```bash
systemctl restart resume-tool
systemctl status resume-tool --no-pager -l
```

## 常见故障速查

### 1. 首页或任务页样式像纯文本

优先检查：

1. 是否部署了最新预构建产物，而不是旧的服务器构建结果。
2. `curl -I https://ai-radar.vip/resume-tool` 是否返回 200。
3. HTML 里的 `_next` 资源路径是否带 `/resume-tool` 前缀。

### 2. 查看演示案例为空

1. 当前修复方案依赖内置本地 demo 数据，不再依赖服务端种子任务。
2. 如果再次为空，优先确认线上代码是否已部署到包含 `demo-task-id` 本地回退逻辑的版本。

### 3. 服务能跑，但外网打不开

检查：

1. `systemctl status resume-tool`
2. `curl -I http://127.0.0.1:3010/resume-tool`
3. `nginx -t`
4. 阿里云安全组是否放行 `80` 和 `443`

### 4. HTTPS 再次失效

检查：

1. `certbot certificates`
2. `curl -I https://ai-radar.vip/resume-tool`
3. `nginx -T | grep -nE 'listen 443|ssl_certificate|server_name'`

## 恢复建议

1. 应用异常但 Nginx 正常：先 `systemctl restart resume-tool`
2. Nginx 配置异常：恢复最近一个有效备份，再 `nginx -t`
3. 发布后页面异常：优先重新执行本地一键部署，确保线上产物与本地构建一致
