# 公司内部 APP 启动包

这是一个可直接运行的内部 APP 原型，适合在需求还没完全定稿时先把项目地基搭好。

## 已准备好的内容

- 可运行的 Node 服务，不依赖外网安装包
- 登录入口和演示账号
- 角色权限模型：管理员、主管、普通员工
- 首页数据看板
- 人员管理中心：员工档案、请假审批、工资结算
- 员工服务区：员工手册、SOP 工作流程
- 部门/岗位管理与员工搜索筛选
- 微信式底部大模块：工作、知识、绩效、管理
- iPhone 可添加到主屏幕的 PWA 配置
- 在线系统部署配置：国内云服务器、Docker、环境变量、健康检查
- PostgreSQL 数据库表结构和演示数据导出脚本
- 审计日志
- 产品准备清单、技术架构、安全清单、插件建议

## 快速启动

```bash
npm start
```

如果当前机器没有 `npm`，可以直接运行：

```bash
node server.js
```

然后打开：

```text
http://127.0.0.1:3000
```

## 在苹果手机上运行

开发阶段如果手机和电脑在同一个 Wi-Fi，可以让服务监听局域网地址：

```bash
HOST=0.0.0.0 node server.js
```

然后在 iPhone Safari 打开：

```text
http://你的电脑局域网IP:3000
```

在 Safari 里点击分享按钮，选择“添加到主屏幕”，就可以像内部 APP 一样从桌面打开。

注意：PWA 的离线缓存和更完整的安装体验通常需要 HTTPS。正式给公司内部使用时，建议部署到内网 HTTPS 域名，例如 `https://hr.company.local`。

## 生成 iPhone 安装包

项目已准备 iOS 原生壳工程：

```text
ios/ChitongInternal/ChitongInternal.xcodeproj
```

安装完整 Xcode 并配置 Apple 开发者账号后，可以打包：

```bash
chmod +x scripts/build-ios-ipa.sh
scripts/build-ios-ipa.sh
```

详细分发方式见：

```text
docs/05-ios-install-package.md
```

如果暂时没有 Apple Developer 账号，先看：

```text
docs/06-before-phone-install.md
```

## 演示账号

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 管理员 | admin@company.local | admin123 |
| 主管 | manager@company.local | manager123 |
| 员工 | user@company.local | user123 |

## 推荐下一步

1. 明确第一个业务模块，例如请假审批、采购申请、客户档案、设备报修、销售日报。
2. 确认部署环境，例如内网服务器、阿里云/腾讯云/Vercel、企业微信/飞书小程序。
3. 接入真实身份体系，例如企业微信、飞书、钉钉、Microsoft Entra ID。
4. 将 `data/app.json` 替换为数据库，例如 PostgreSQL、MySQL 或 SQLite。

## 在线系统上线

项目已准备最低成本上线文件，国内环境建议优先看这份：

```text
Dockerfile
deploy/tencent/docker-compose.yml
deploy/tencent/README.md
deploy/tencent/purchase-checklist.md
.env.example
db/schema.sql
scripts/export-seed-sql.mjs
docs/08-china-deployment.md
```

生成 PostgreSQL 演示种子数据：

```bash
npm run db:seed:export
```

完整上线步骤见：

```text
docs/08-china-deployment.md
```

## 当前人员管理模块

- 底部模块：工作、知识、绩效、管理，适合手机上快速切换。
- 员工版本：只显示工作、知识。
- 管理员/主管版本：显示工作、知识、绩效、管理。
- 当前部门：摄影部、剪辑部、财务部。
- KFS 绩效：K=关键成果，F=流程效率，S=服务协作，用于工资绩效结算展示。
- 员工工作台：工作表、日程表、今日安排。
- 员工服务区：员工手册、SOP 工作流程、制度搜索和流程步骤查看。
- 管理员权限板块：员工档案、部门岗位、人员安排、请假审批和审计日志。
- 员工档案：新增员工、查看部门/岗位/入职时间/年假余额。
- 员工搜索筛选：按姓名、部门、岗位快速筛员工。
- 部门管理：新增部门、负责人和编制。
- 岗位管理：新增岗位、所属部门、职级和薪资带。
- 请假审批：选择员工、提交请假类型、天数和原因，并支持通过/驳回。
- 工资结算：查看工资批次、应发、扣减、实发和发放状态，并支持生成本月工资单。
- 员工详情：查看个人档案、假期记录和工资记录。
- 工资单详情：查看单人工资的基本工资、补贴、扣减和实发金额。
- 审计日志：记录登录、新增员工、提交请假、审批假单、生成工资单等关键操作。
