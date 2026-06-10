# 没有 Apple Developer 账号时，安装到 iPhone 前能做完的事

## 不能绕过的限制

iPhone 安装包必须由 Apple 认可的证书签名。没有 Apple Developer Program 时，不能做可发给全公司员工自由安装的 `.ipa`。

这不是技术偷懒，是 Apple 平台规则。不要使用来历不明的企业证书、描述文件或第三方签名平台，它们可能导致账号、设备和公司数据风险。

## 现在已经准备好的内容

- Web 端内部系统原型。
- iPhone PWA 版本，可添加到主屏幕。
- iOS 原生壳工程，路径为 `ios/ChitongInternal/ChitongInternal.xcodeproj`。
- iOS App 图标。
- 可配置内部系统地址。
- 本地 HTTP 调试许可，仅用于开发阶段。
- Ad Hoc 和 Enterprise 导出配置模板。
- `.ipa` 打包脚本。

## 无账号阶段的可行路线

### 路线 A：继续用 PWA

这是当前最省事、最稳的方式。

```bash
HOST=0.0.0.0 node server.js
```

iPhone Safari 打开电脑局域网地址，然后添加到主屏幕。

### 路线 B：用 Xcode + 免费 Apple Account 装到自己的 iPhone

适合你自己或开发者调试，不适合公司分发。

准备：

- 安装完整 Xcode。
- 用 Apple Account 登录 Xcode。
- 用数据线连接 iPhone。
- 在 Xcode 里选择 Personal Team。
- 修改 Bundle ID，避免和别人冲突。
- 把 `INTERNAL_APP_URL` 改成手机能访问的地址，例如局域网 IP 或 HTTPS 内网域名。

注意：

- 免费账号通常只适合个人开发调试。
- App 可能有有效期限制。
- 不能作为公司正式分发方式。

### 路线 C：等公司开 Apple Developer Program

适合 TestFlight 或 Apple Business Manager 自定义 App。

你需要准备：

- 公司 Apple Developer Program。
- App Store Connect 权限。
- Bundle ID。
- 隐私说明。
- 测试账号。
- 内部 HTTPS 域名。

### 路线 D：等公司开 Apple Developer Enterprise Program

适合大型组织的内部分发，但门槛更高。

你需要准备：

- 公司主体资格。
- D-U-N-S Number。
- 内部安全分发系统或 MDM。
- 只面向员工的访问控制。
- 通过 Apple 审核和持续评估。

## 我们下一步还可以继续做

- 把本地 JSON 数据换成 SQLite 或 PostgreSQL。
- 接公司登录系统。
- 做 HTTPS 内网部署脚本。
- 做 iOS 启动画面和错误页。
- 做“无法连接服务器”的离线提示。
- 做真正的权限控制，防止普通员工访问薪资数据。

