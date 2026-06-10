# 在线系统最低成本上线方案

目标：先用最低成本把“赤瞳工作空间”变成手机可打开的 HTTPS 在线系统，后续再逐步接入正式数据库、企业微信/飞书身份和更严格权限。

## 推荐架构

```text
iPhone / 电脑浏览器
        ↓ HTTPS
Render Web Service
        ↓ 未来接入
Neon PostgreSQL
```

当前代码已经可以直接部署到 Render。现阶段仍使用 JSON 演示数据，适合给团队试用流程；正式多人使用前，需要接入 PostgreSQL。

## 最低成本组合

| 部分 | 推荐 | 费用 |
| --- | --- | --- |
| 应用托管 | Render Web Service Free 起步 | $0/月 起 |
| 数据库 | Neon Free 起步 | $0/月 起 |
| 域名 | 先用 Render 免费域名 | $0 |
| iPhone 使用 | Safari 打开后添加到主屏幕 | $0 |
| 安装包 | 暂不做 | 省 Apple 账号费用 |

## 已准备好的文件

- `render.yaml`：Render 一键部署配置。
- `Dockerfile`：容器部署备用方案。
- `.env.example`：本地和生产环境变量模板。
- `db/schema.sql`：PostgreSQL 正式表结构。
- `scripts/export-seed-sql.mjs`：把 `data/app.json` 转成 `db/seed-demo.sql`。

## 最简单上线：先只用 Render

如果你的目标是“先让手机能打开在线系统”，可以暂时跳过 Neon。

1. 登录 Render。
2. 点击 `New`。
3. 选择 `Blueprint`。
4. 连接 GitHub 仓库：

```text
skateqingming/chitong-workspace
```

5. Render 会自动读取 `render.yaml`。
6. 直接点击部署。
7. 部署完成后，打开 Render 给你的 HTTPS 地址。

这个方式成本最低、操作最少，但它使用的是演示数据文件。免费服务重启后，数据可能回到初始演示状态。

## 正式数据上线：再做 Neon

当你准备让多人长期使用，再执行下面的数据库步骤。

## 第一步：生成数据库演示数据

```bash
npm run db:seed:export
```

生成：

```text
db/seed-demo.sql
```

## 第二步：创建 Neon 数据库

1. 注册或登录 Neon。
2. 创建一个 PostgreSQL 项目。
3. 打开 SQL Editor。
4. 先执行 `db/schema.sql`。
5. 再执行 `db/seed-demo.sql`。
6. 复制 Neon 的 `DATABASE_URL`，后续服务端切换 PostgreSQL 数据层时使用。

注意：当前服务端还没有真正切到 PostgreSQL 读写，`DATABASE_URL` 是为下一阶段预留。正式多人使用前，必须把 API 数据层从 JSON 文件切到数据库。

## 第三步：部署到 Render

1. 把项目上传到 GitHub。
2. 登录 Render。
3. New → Blueprint。
4. 选择这个仓库。
5. Render 会读取 `render.yaml`。
6. 如果只是预览版，不需要额外填写环境变量。Render 会使用 `render.yaml` 里的默认值：

```text
NODE_ENV=production
HOST=0.0.0.0
DATA_FILE=/tmp/chitong-app.json
MAX_BODY_BYTES=1048576
```

7. 部署完成后，Render 会给一个 HTTPS 地址，例如：

```text
https://chitong-workspace.onrender.com
```

## 第四步：手机打开

1. 用 iPhone Safari 打开 Render 的 HTTPS 地址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 桌面会出现“赤瞳工作空间”图标。

## 重要限制

当前 Render 部署默认使用 `/tmp/chitong-app.json` 存演示数据。它适合预览，不适合正式长期使用，因为免费服务重启后数据可能回到初始演示状态。

正式上线必须完成下一步：

```text
把 server.js 的 loadData/saveData 替换为 PostgreSQL 数据层。
```

## 正式版最低开发顺序

1. 接入 PostgreSQL 数据层。
2. 把演示明文密码改成安全密码哈希。
3. 增加真实登录会话和接口鉴权。
4. 管理员才能写入人员、排班、工资、通知。
5. 员工接口只返回和本人相关的数据。
6. 开启自动备份和审计日志保留策略。

## 推荐先不上安装包的原因

在线系统可以先把流程跑通，员工无需安装，管理员改完所有人立即看到。等业务模块稳定后，再考虑把在线系统套成 iOS 壳或者接企业微信入口。
