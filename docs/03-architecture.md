# 架构草图

## 当前原型

```text
Browser
  -> public/index.html
  -> server.js
  -> data/app.json
```

这个版本适合演示、梳理流程、确定页面和字段。

## 生产架构建议

```text
Browser / Mobile Web / Mini Program
  -> CDN / Reverse Proxy
  -> API Service
  -> PostgreSQL
  -> Object Storage
  -> Message Queue
  -> Audit Log / Monitoring
```

## 核心模块

- 身份认证：登录、退出、会话、单点登录。
- 用户组织：部门、岗位、直属上级、角色。
- 权限中心：菜单权限、数据权限、操作权限。
- 业务模块：审批、工单、报表、档案或你指定的核心流程。
- 通知中心：待办提醒、审批结果、异常告警。
- 审计中心：谁在什么时间做了什么。
- 系统设置：字段、流程、角色、集成配置。

## 数据表起点

- users
- departments
- roles
- permissions
- approval_requests
- approval_steps
- attachments
- audit_logs
- notifications

