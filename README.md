# Campus Market - 启动指南

Campus Market 是一个面向高校的校园二手交易与闲置物品发布平台，本仓库包含前端 (web, React + Vite + Ant Design) 与后端 (server, Spring Boot + JPA + MySQL)，以及部分运维与部署脚本。

## 项目简介

Campus Market 主要用于校园内部闲置物品的发布与浏览，提供基础的商品管理、图片上传与展示、用户认证等能力，便于在校师生安全、高效地完成二手交易。

本 README 面向开发者与运维人员，说明如何在本地运行、调试与部署该系统。

## 技术栈

- **前端 (web)**
  - React 18 + TypeScript
  - Vite 6 构建工具
  - Ant Design 组件库 (`antd`)
  - React Router DOM 6
  - @tanstack/react-query 做数据请求与缓存
  - Axios 请求库
  - Zustand 作为轻量状态管理
  - React Hook Form + Zod 表单与校验

- **后端 (server)**
  - Spring Boot 3（Web / Validation / Security / Data JPA）
  - MySQL 8 / H2（开发环境可选）
  - Flyway 数据库版本管理
  - JJWT (io.jsonwebtoken) 实现 JWT 鉴权
  - Lombok 简化实体与 DTO 代码

- **运维 / 其他**
  - Maven 作为构建工具
  - Docker Compose（`ops/compose/docker-compose.yml`，提供 MySQL + Redis 服务）
  - PowerShell 脚本（`ops/scripts/run-backend.ps1` 等）

## 目录结构

```text
├── server/                 # Spring Boot 后端
│   ├── src/main/java       # 业务代码（controller, service, repository, domain 等）
│   ├── src/main/resources  # application 配置、Flyway 脚本等
│   └── uploads/            # 运行时上传的图片文件（按日期分目录）
├── web/                    # React 前端
│   ├── src/app, pages      # 路由与页面
│   ├── src/components      # 通用组件
│   ├── src/services        # API 客户端与请求封装
│   ├── src/store           # 状态管理（Zustand）
│   └── src/ui, styles      # UI 封装与样式
├── ops/                    # 运维与部署相关
│   ├── compose/            # docker-compose 文件
│   ├── nginx/              # Nginx 配置（可用于前端静态资源与反向代理）
│   └── scripts/            # 辅助脚本（如运行后端）
├── docs/                   # 额外文档（如接口说明等，可按需补充）
└── image/                  # 项目截图等资源
```

## 环境要求

- Node.js 18+
- npm 9+
- Java 17
- Maven 3.9+
- MySQL 8.x（本地或远程均可）
- 可选：Docker / Docker Compose（用于本地快速启动 MySQL + Redis）

## 快速开始（本地开发）

### 1. 克隆仓库

```bash
git clone <your-repo-url> campus-market
cd campus-market
```

### 2. 数据库准备

- **方式 A：本机 MySQL**
  - 创建数据库，例如：`campus_market`
  - 确保字符集为 `utf8mb4`，排序规则为 `utf8mb4_unicode_ci`。

- **方式 B：Docker Compose（推荐快速体验）**
  ```bash
  cd ops/compose
  docker-compose up -d
  ```
  - 默认会启动：
    - MySQL 8，数据库名 `campus_market`，root 密码 `root`
    - Redis 7

### 3. 后端配置（server）

在 `server/src/main/resources/application.properties`（或根据需要新增 `application-local.properties`）中配置数据库连接：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_market?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=你的用户名
spring.datasource.password=你的密码
spring.jpa.hibernate.ddl-auto=none
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.globally_quoted_identifiers=true
# 静态资源 /uploads 建议映射在后端静态目录
```

- 首次启动时，Flyway 会自动执行迁移脚本初始化表结构。

### 4. 启动后端

- **开发模式（推荐）**
  ```bash
  cd server
  mvn spring-boot:run
  ```

- **打包运行**
  ```bash
  cd server
  mvn clean package -DskipTests
  java -jar target/campus-market-0.0.1-SNAPSHOT.jar
  ```

- 默认后端地址：`http://localhost:8080`
- API 前缀：`/api`，例如 `http://localhost:8080/api/v1/products`

### 5. 启动前端

```bash
cd web
npm install
npm run dev
```

- 默认前端地址：`http://localhost:3000`
- Vite HMR 已开启，保存代码会自动热更新。

### 6. 前端环境变量

在 `web` 目录下创建 `.env.local`（可选）：

```bash
VITE_API_BASE=http://localhost:8080/api
```

- 若未设置，前端会默认使用 `http://localhost:8080/api`。
- 静态资源基址由 `ASSET_BASE_URL = VITE_API_BASE 去掉 /api` 推导，用于拼接 `/uploads/...` 图片地址。

## 接口与鉴权说明

- 使用登录接口 `/api/v1/auth/login` 获取 JWT token。
- 前端会将 token 写入 `localStorage`，并通过请求拦截器自动附加到请求头（`Authorization: Bearer <token>`）。
- 受保护接口会在后端通过 Spring Security 校验 token 合法性与权限。

项目集成了 Springdoc OpenAPI，启动后可在浏览器访问后端提供的接口文档页面（Swagger UI，访问地址依具体配置而定）。

## 构建与部署

### 前端构建

```bash
cd web
npm install
npm run build
```

- 产物默认输出到 `web/dist` 目录，可由 Nginx、静态文件服务器或 Spring Boot 静态目录托管。

### 后端构建

```bash
cd server
mvn clean package -DskipTests
```

- 会在 `server/target` 目录生成可执行 JAR。
- 生产环境推荐通过环境变量或 JVM 启动参数（如 `-Dspring.profiles.active=prod`、`-Dspring.datasource.*`）覆盖默认配置。

### Docker / 生产部署（示意）

- 使用 `ops/compose/docker-compose.yml` 启动数据库和缓存。
- 将后端 JAR 部署到服务器（或容器）中运行。
- 使用 Nginx 反向代理：
  - 将 `/api` 路径转发到后端 Spring Boot 服务。
  - 将其余静态请求（`/` 等）指向前端构建产物 `dist`。

具体生产环境部署方案可根据实际基础设施（Kubernetes、云厂商等）调整。

## 常见问题（FAQ）

- **发布商品 500 报错（MySQL 保留字 `condition` 冲突）**
  - 已通过 `spring.jpa.properties.hibernate.globally_quoted_identifiers=true` 解决。

- **图片关联 `product_id` 为 null**
  - 已改为 `@OneToMany(mappedBy = "product", cascade = ALL)` 并在保存前调用 `img.setProduct(p)`。

- **懒加载报错（LazyInitializationException 等）**
  - 将 `Product.images` 设置为 `FetchType.EAGER`，并在 `ProductImage.product` 上添加 `@JsonIgnore`，避免序列化循环引用。

- **前端登录 / 重定向问题**
  - 通过头像入口打开登录弹窗。
  - 未登录访问受限路由时会记录 `pendingRedirect`，登录成功后自动跳转回原访问页面。

## 贡献与开发规范

- 提交前请运行前端 `npm run lint` 与后端相关检查（如有配置）。
- 建议使用 feature 分支进行开发，合并前通过代码评审。
- 文档与注释统一使用简体中文。

## 许可协议

如未在仓库中另行声明，可按团队内部约定或默认公司/个人协议执行。

如需补充 API 详细文档、页面说明或部署脚本示例，可在 `docs/` 目录继续扩展.
