# 腾讯云上线操作清单

这份清单只按“企业管理系统 + 未来 App 后端”来选型，不包含官网和企业邮箱。

## 先买什么

### 第一阶段推荐

买一台腾讯云轻量应用服务器：

- 地域：`中国香港` 优先，先免备案快速上线；后续正式长期使用再考虑中国大陆地域。
- 系统：Ubuntu 22.04 LTS。
- 配置：`2 核 4G` 优先。
- 带宽：先用默认套餐，员工明显觉得慢再升级。
- 硬盘：系统盘默认即可，附件量大以后再上对象存储。

为什么选 `2 核 4G`：

- 一台机器可以同时跑内部系统、Nginx、Docker 和未来 App 接口。
- 比 `2 核 2G` 更不容易在构建、重启、多人访问时卡住。
- 后续接 App 后端还有余量。

如果只想极限省钱，可以先选 `2 核 2G`，但我不建议公司正式使用从这个配置起步。

## 暂时不要买什么

第一阶段先不要买：

- 云数据库 PostgreSQL。
- 对象存储 COS。
- 负载均衡。
- CDN。
- 高防、安全加速。

原因：

- 现在先验证公司内部流程，不需要一次把全套企业云架构买齐。
- 数据库要等服务端切到 PostgreSQL 后再买，避免买了暂时用不上。
- 附件、图片、合同、发票量起来后，再加 COS。

## 域名怎么规划

第一阶段可以先不买域名，直接用服务器公网 IP 测试。

如果要给员工长期使用，再买一个域名，例如：

```text
chitongmedia.com
```

只需要先规划这两个地址：

```text
workspace.chitongmedia.com  内部管理系统
api.chitongmedia.com        未来 App 后端
```

如果服务器在中国香港，可以先不做 ICP 备案。

如果以后换成中国大陆服务器，域名面向公网访问时需要 ICP 备案。

## 腾讯云购买时怎么选

进入腾讯云轻量应用服务器后，照下面选：

```text
产品：轻量应用服务器
地域：中国香港
镜像：Ubuntu 22.04 LTS
套餐：2 核 4G
带宽：默认
购买时长：先 1 个月或 3 个月
登录方式：密码登录或 SSH 密钥登录
防火墙：放行 22、80、443
```

不要勾选额外安全、监控、备份、数据库、对象存储等增值项。先把系统跑起来。

## 第一次部署

服务器登录后安装基础工具：

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin nginx
sudo systemctl enable --now docker nginx
```

拉代码：

```bash
git clone https://github.com/skateqingming/chitong-workspace.git
cd chitong-workspace
```

启动应用：

```bash
docker compose -f deploy/tencent/docker-compose.yml up -d --build
```

检查：

```bash
curl http://127.0.0.1:3000/healthz
```

## 配置 Nginx

把 `deploy/tencent/nginx.conf` 里的域名替换成你的真实域名：

```text
workspace.example.com
```

复制到服务器：

```bash
sudo cp deploy/tencent/nginx.conf /etc/nginx/sites-available/chitong-workspace.conf
sudo ln -s /etc/nginx/sites-available/chitong-workspace.conf /etc/nginx/sites-enabled/chitong-workspace.conf
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS

腾讯云控制台可以申请免费 SSL 证书。

拿到证书后，把 Nginx 从 `listen 80` 升级到 `listen 443 ssl`，并配置证书路径。

第一天先用 HTTP 跑通流程可以，正式发给员工前必须上 HTTPS。

## 什么时候升级数据库

出现这些情况就该上腾讯云 PostgreSQL：

- 已经有 5 人以上每天使用。
- 员工资料、工资、请假、公告不能丢。
- 管理员开始频繁编辑数据。
- 需要审计、备份、权限隔离。

升级时再做：

1. 购买腾讯云 PostgreSQL。
2. 执行 `db/schema.sql`。
3. 导入 `db/seed-demo.sql`。
4. 把服务端数据层从 JSON 改成 PostgreSQL。
5. 打开自动备份。
