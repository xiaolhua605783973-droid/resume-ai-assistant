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
2. [deploy/alicloud/package.sh](/Users/riclesmacbook/project/Ai求职全链路/deploy/alicloud/package.sh)
3. [deploy/alicloud/local_deploy.sh](/Users/riclesmacbook/project/Ai求职全链路/deploy/alicloud/local_deploy.sh)
4. [docs/ACCEPTANCE_CHECKLIST.md](/Users/riclesmacbook/project/Ai求职全链路/docs/ACCEPTANCE_CHECKLIST.md)
5. [docs/OPERATIONS_RUNBOOK.md](/Users/riclesmacbook/project/Ai求职全链路/docs/OPERATIONS_RUNBOOK.md)

脚本会完成这些事：

1. 本地 `package.sh` 安装依赖并生成 Next.js standalone 预构建包
2. 服务器 `deploy.sh` 安装基础依赖：`curl`、`tar`、`xz`、`rsync`、`nginx`
3. 服务器下载独立 Node.js 运行时到 `/opt/resume-tool/runtime`
4. 服务器写入部署环境文件
5. 服务器解压预构建包到应用目录
6. 创建并启动 `systemd` 服务
7. 生成 Nginx 子路径代理片段
8. 把 `include` 语句插入 ai radar 当前的 Nginx `server` 配置
9. 校验并重载 Nginx

## 推荐流程：本地预构建，服务器只运行

### 第一步：本地生成部署包

在本地仓库根目录执行：

```bash
APP_BASE_PATH=/resume-tool \
APP_URL=https://ai-radar.vip/resume-tool \
bash deploy/alicloud/package.sh
```

默认会生成：

```bash
dist/resume-tool-prebuilt.tar.gz
```

### 第二步：把部署包传到服务器

```bash
scp dist/resume-tool-prebuilt.tar.gz admin@your-server:/home/admin/resume-ai-assistant/dist/
```

## 一键本地执行方案

如果你已经有 SSH 私钥，并且希望从本地一条命令完成：本地打包、上传部署包、上传最新部署脚本、远程执行部署，可以直接运行：

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

这个脚本会自动完成：

1. 本地执行 `package.sh` 生成 standalone 部署包
2. 通过 `ssh` 创建远程 `dist/` 目录
3. 通过 `scp` 上传最新的 `deploy.sh`
4. 通过 `scp` 上传最新部署包
5. 在远程服务器上执行 `deploy.sh`

常用可选变量：

1. `SSH_PORT`：SSH 端口，默认 `22`
2. `REMOTE_REPO_DIR`：远程仓库目录，默认 `/home/admin/resume-ai-assistant`
3. `APP_URL`：如果你想显式指定线上 URL，可直接传入；默认使用 `http://<APP_DOMAIN><APP_BASE_PATH>`

## 使用方式

先把仓库放到阿里云服务器上，再把预构建包传到服务器，然后在仓库根目录执行：

```bash
sudo APP_DOMAIN=example.com \
  APP_BASE_PATH=/resume-tool \
  APP_PORT=3010 \
  NGINX_SERVER_CONF=/etc/nginx/conf.d/ai-radar.conf \
  ARTIFACT_FILE=/home/admin/resume-ai-assistant/dist/resume-tool-prebuilt.tar.gz \
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
5. `ARTIFACT_FILE`: 本地预构建后上传到服务器的部署包路径。

## 更新发布

更新时，不再在服务器构建；改为重新本地打包、上传、再重复执行部署命令：

```bash
APP_BASE_PATH=/resume-tool \
APP_URL=https://example.com/resume-tool \
bash deploy/alicloud/package.sh

scp dist/resume-tool-prebuilt.tar.gz admin@your-server:/path/to/repo/dist/

ssh admin@your-server
cd /path/to/repo
sudo APP_DOMAIN=example.com \
  APP_BASE_PATH=/resume-tool \
  APP_PORT=3010 \
  NGINX_SERVER_CONF=/etc/nginx/conf.d/ai-radar.conf \
  ARTIFACT_FILE=/path/to/repo/dist/resume-tool-prebuilt.tar.gz \
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
5. `package.sh` 生成的部署包必须和服务器部署时使用同一个 `APP_BASE_PATH`，否则静态资源路径会错位。
6. 上线完成后，建议按 [docs/ACCEPTANCE_CHECKLIST.md](/Users/riclesmacbook/project/Ai求职全链路/docs/ACCEPTANCE_CHECKLIST.md) 做验收，并把长期维护信息收敛到 [docs/OPERATIONS_RUNBOOK.md](/Users/riclesmacbook/project/Ai求职全链路/docs/OPERATIONS_RUNBOOK.md)。