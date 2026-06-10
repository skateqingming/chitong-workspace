# iPhone 安装包分发方案

## 先说结论

iPhone 不能像 Android 一样随便发一个安装包让员工直接安装。iOS 安装包必须经过 Apple 签名和允许的分发方式。

当前项目已经准备了一个 iOS 原生壳工程：

```text
ios/ChitongInternal/ChitongInternal.xcodeproj
```

这个壳会用 `WKWebView` 打开内部系统地址。业务代码继续放在 Web 端，iOS 包负责安装、桌面图标和系统级容器。

## 推荐路线

### 1. TestFlight

适合早期测试和小范围内测。

- 需要 Apple Developer Program。
- 需要在 App Store Connect 上传构建。
- 内部测试人员最多 100 个开发团队成员。
- 外部测试最多 10000 人，但外部测试构建需要经过 TestFlight 审核。

### 2. Apple Business Manager 自定义 App

适合公司正式内部使用，尤其是有 MDM 或 IT 管理能力的公司。

- 需要 Apple Developer Program。
- App 需要经过 App Review。
- 可以指定只有某个组织能看到和安装。
- 公司可通过 Apple Business Manager、MDM 或兑换码分发。

### 3. Apple Developer Enterprise Program

适合大型组织直接内部分发。

- 只适合 Apple 认可的特定内部使用场景。
- 通常要求组织 100 人以上。
- 需要内部安全分发系统或 MDM。
- Apple 会审核资格和持续评估。

### 4. Ad Hoc

适合极小范围测试。

- 需要收集每台 iPhone 的 UDID。
- 每次换手机都要重新配置设备。
- 不适合公司规模化分发。

## 当前工程需要你替换的配置

1. 修改内部系统地址：

```swift
// ios/ChitongInternal/ChitongInternal/AppConfig.swift
static let appURL = URL(string: "https://hr.company.local")!
```

2. 修改 Bundle ID：

```text
com.company.chitong.internal
```

建议改成你的公司域名反写，例如：

```text
com.yourcompany.hr
```

3. 在 Xcode 里选择你的 Team。

4. 正式环境必须使用 HTTPS。不要把内网 IP 或本地 `localhost` 放进正式包。

## 打包命令

在安装完整 Xcode 并登录 Apple 开发者账号的 Mac 上运行：

```bash
chmod +x scripts/build-ios-ipa.sh
scripts/build-ios-ipa.sh
```

默认使用 Ad Hoc 导出配置：

```text
ios/ChitongInternal/ExportOptions-AdHoc.plist
```

如果公司有 Enterprise 账号，可以使用：

```bash
EXPORT_OPTIONS=ios/ChitongInternal/ExportOptions-Enterprise.plist scripts/build-ios-ipa.sh
```

生成位置：

```text
build/ios/export
```

## 当前机器限制

当前环境只有 Xcode Command Line Tools，没有完整 Xcode，所以不能在这里直接生成 `.ipa`。

需要安装完整 Xcode 后才能执行：

```bash
xcodebuild archive
xcodebuild -exportArchive
```

