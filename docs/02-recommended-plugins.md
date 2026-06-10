# 需要的插件与系统能力

这里的“插件”分两类：开发时 Codex 能帮你用的插件，以及最终 APP 需要接入的企业系统插件/能力。

## 当前 Codex 工作需要的插件

- Browser：用于打开本地页面、点点看、截图验收前端效果。
- GitHub：用于把代码提交到仓库、开 PR、看 CI。
- Spreadsheets：如果你要从 Excel 表导入需求、人员、审批数据，会很有用。
- Documents：如果你要生成需求文档、验收文档、用户手册，会很有用。
- Linear：如果团队用 Linear 管需求和任务，可以接入。

当前这个启动包没有强制依赖外部插件，先保证项目能在本地跑起来。

## APP 生产环境建议接入

- 企业身份登录：企业微信、飞书、钉钉、Microsoft Entra ID、Okta。
- 通知：企业微信机器人、飞书机器人、短信、邮件。
- 文件存储：阿里云 OSS、腾讯云 COS、AWS S3、MinIO。
- 数据库：PostgreSQL、MySQL、SQLite。
- 日志与监控：Sentry、OpenTelemetry、Grafana、云厂商日志服务。
- 审批/组织通讯录：企业微信/飞书/钉钉开放平台。
- AI 助手：OpenAI API 或企业内部模型，用于智能搜索、表单摘要、自动草稿。

## 我建议的默认组合

- 前端：React 或 Next.js
- 后端：Node.js 或 NestJS
- 数据库：PostgreSQL
- 登录：企业微信或飞书 SSO
- 部署：Docker + 内网服务器
- 监控：Sentry + 结构化日志

