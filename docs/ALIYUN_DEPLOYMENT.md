# 阿里云部署说明

目标场景：

1. 服务器上已经有 ai radar 主站。
2. 当前简历工具复用同一域名。
3. 当前简历工具以独立网页形式挂在同域名子路径下，例如 `/resume-tool`。

推荐拓扑：

1. ai radar 继续占用原有站点根路径，例如 `https://example.com/`
2. 简历工具独立运行在本机端口，例如 `127.0.0.1:3010`
3. Nginx 在现有 ai radar `server` 配置中追加一个子路径反向代理，例如 `location ^~ /resume-tool/`

这样做的原因：

1. 不需要改动 ai radar 现有域名和证书结构。
2. 简历工具可以独立发布和回滚。
3. 两个应用共用 80/443，但进程彼此隔离。

## 应用侧准备

当前仓库已经支持以下部署变量：

1. `NEXT_PUBLIC_APP_BASE_PATH=/resume-tool`
2. `NEXT_PUBLIC_APP_URL=https://example.com/resume-tool`
3. `TASK_DATA_DIR=/var/lib/resume-tool/tasks`

其中：

1. `NEXT_PUBLIC_APP_BASE_PATH` 让 Next.js 在子路径下生成正确路由。
2. `TASK_DATA_DIR` 把任务 JSON 数据放到仓库外，避免重新部署时被覆盖。

## 一键部署脚本

脚本位置：

1. [deploy/alicloud/deploy.sh](/Users/riclesmacbook/project/Ai求职全链路/deploy/alicloud/deploy.sh)

脚本会完成这些事：

1. 安装基础依赖：`curl`、`tar`、`xz`、`rsync`、`nginx`
2. 下载独立 Node.js 运行时到 `/opt/resume-tool/runtime`
3. 写入部署环境文件
4. 在 `web/` 下执行 `npm ci` 和生产构建
5. 创建并启动 `systemd` 服务
6. 生成 Nginx 子路径代理片段
7. 把 `include` 语句插入 ai radar 当前的 Nginx `server` 配置
8. 校验并重载 Nginx

## 使用方式

先把仓库放到阿里云服务器上，然后在仓库根目录执行：

```bash
sudo APP_DOMAIN=example.com \
  APP_BASE_PATH=/resume-tool \
  APP_PORT=3010 \
  NGINX_SERVER_CONF=/etc/nginx/conf.d/ai-radar.conf \
  ANALYSIS_API_BASE_URL=https://api.deepseek.com \
  ANALYSIS_API_KEY=your-key \
  ANALYSIS_API_MODEL=deepseek-v4-flash \
  bash deploy/alicloud/deploy.sh
```

关键参数说明：

1. `APP_DOMAIN`: ai radar 当前站点域名。
2. `APP_BASE_PATH`: 简历工具在同域名下的独立入口路径，默认 `/resume-tool`。
3. `APP_PORT`: 简历工具独立监听端口，默认 `3010`。
4. `NGINX_SERVER_CONF`: ai radar 当前域名对应的 Nginx `server` 配置文件。

## 更新发布

服务器上拉取新代码后，直接重复执行同一条命令即可：

```bash
cd /path/to/repo
git pull
sudo APP_DOMAIN=example.com \
  APP_BASE_PATH=/resume-tool \
  APP_PORT=3010 \
  NGINX_SERVER_CONF=/etc/nginx/conf.d/ai-radar.conf \
  ANALYSIS_API_BASE_URL=https://api.deepseek.com \
  ANALYSIS_API_KEY=your-key \
  ANALYSIS_API_MODEL=deepseek-v4-flash \
  bash deploy/alicloud/deploy.sh
```

## 注意事项

1. 脚本会修改现有 ai radar 的 Nginx `server` 配置，因此运行前会先备份该文件。
2. 当前自动插入逻辑假设 `NGINX_SERVER_CONF` 里主要是单个 `server` 块；如果你的主站配置非常复杂，先人工确认备份和插入结果。
3. 子路径部署必须在构建前设置 `NEXT_PUBLIC_APP_BASE_PATH`，不能只靠 Nginx 转发。
4. 任务数据默认写入 `/var/lib/resume-tool/tasks`，便于保留历史任务记录。