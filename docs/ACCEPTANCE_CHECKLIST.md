# 上线验收清单

适用对象：`https://ai-radar.vip/resume-tool`

## 访问与可用性

1. 打开 `https://ai-radar.vip/resume-tool`，确认首页正常加载。
2. 确认浏览器地址栏显示 HTTPS 锁标，无证书报错。
3. 打开首页 CTA，确认 `立即开始 AI 优化` 能跳转到任务创建流程。
4. 点击 `查看演示案例`，确认可进入演示案例并看到预填充的“陈一鸣”表单。

## 演示流程验收

1. 在演示案例中确认基础信息、工作经历、项目经历、技能不为空。
2. 进入 JD 页面，确认已有或可输入 JD 文本。
3. 进入匹配分析页，确认能看到匹配项、缺失项、风险项和 ATS 建议。
4. 进入简历编辑页，确认预览正常显示，且导出按钮可见。
5. 触发浏览器打印预览，确认 PDF 页面头部、职业总结和正文内容可见。

## 真任务流程验收

1. 从首页进入新建任务，确认能够创建服务端任务。
2. 在录入页手动输入基础信息，确认无明显卡顿、跳动或输入法异常。
3. 上传一个真实 TXT、PDF 或 DOCX 简历，确认解析不报错。
4. 在 JD 页面粘贴真实岗位描述，确认结构化分析可生成。
5. 在分析页点击继续，确认能进入简历编辑页。
6. 在简历编辑页修改内容，确认自动保存状态正常。
7. 导出 PDF，确认版式、中文字体和标题正常。

## 线上服务检查

1. 执行 `systemctl status resume-tool --no-pager -l`，确认服务为 `active (running)`。
2. 执行 `curl -I http://127.0.0.1:3010/resume-tool`，确认返回 `200`。
3. 执行 `curl -I https://ai-radar.vip/resume-tool`，确认返回 `200`。
4. 执行 `nginx -t`，确认语法通过且无 warning。

## 数据与配置检查

1. 确认任务数据目录存在：`/var/lib/resume-tool/tasks`。
2. 确认应用环境文件存在：`/opt/resume-tool/config/resume-tool.env`。
3. 确认 `NEXT_PUBLIC_APP_BASE_PATH=/resume-tool`。
4. 确认 `TASK_DATA_DIR` 指向仓库外目录。
5. 确认当前线上使用的是最新有效 API key，而不是已废弃 key。

## 回归风险点

1. `查看演示案例` 不应依赖服务器种子任务； fresh deploy 后也应正常显示。
2. Nginx 站点备份文件不要放在 `/etc/nginx/sites-enabled`，否则可能再次引入冲突 warning。
3. 新版本部署后，首页样式不应退化成纯文本布局；若发生，优先检查是否真的部署了本地预构建产物。
4. HTTPS 证书续期后，应继续验证 `/resume-tool` 子路径可访问。
