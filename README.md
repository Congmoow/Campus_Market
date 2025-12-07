# 校园二手交易平台（Campus Market）

一个面向在校学生的校园二手闲置交易平台，前端基于 React + Vite + Tailwind CSS，后端基于 Spring Boot 3 + MyBatis-Plus + PostgreSQL，实现商品发布、浏览、收藏、下单、聊天等完整闭环。

---

## 功能概览

- **商品浏览**
  - 发现好物瀑布流列表，按分类、排序（最新发布 / 价格 / 最多浏览）筛选
  - 商品卡片展示价格、标题、位置、时间、浏览量等基础信息
- **商品详情**
  - 多图预览、大图 + 缩略图图库
  - 右上角展示收藏、分享、浏览量（多少人看过）
  - 展示价格、原价、位置、发布时间、卖家信用等信息
- **商品发布与管理**
  - 发布商品：上传图片、设置价格、分类、描述等
  - 我的商品：查看自己发布的商品列表，支持编辑、上下架、删除
- **收藏与订单**
  - 收藏 / 取消收藏商品，在个人中心查看收藏列表
  - 下单购买商品，查看我的订单、订单详情
- **聊天沟通**
  - 基于商品一键发起聊天，买卖双方可在站内即时沟通
- **用户中心**
  - 个人信息展示与编辑（头像、昵称等）
  - 查看我的商品 / 我的订单 / 我的收藏

> 上述为当前代码中已实现或预留能力的概览，具体 UI 以实际页面为准。

---

## 技术栈

### 前端

- **框架**：React 18 + React Router DOM 6
- **构建工具**：Vite 5
- **UI 与样式**：
  - Tailwind CSS 3
  - 自定义组件与动画（含 Lottie 动效）
  - `lucide-react` 图标库
- **状态与工具**：
  - Axios 封装请求（`src/api`）
  - 一些工具函数封装在 `src/lib/utils.js`

### 后端

- **框架**：Spring Boot 3.2
- **持久层**：
  - MyBatis-Plus（含分页插件）
  - Spring Data Commons（提供 Page / Pageable 等抽象）
- **数据库**：PostgreSQL
- **安全与认证**：Spring Security + JWT（jjwt）
- **其他**：
  - Lombok 简化实体 / DTO 代码
  - HikariCP 连接池

### 开发工具

- Node.js（建议 18+）
- Maven Wrapper（项目自带 `backend/mvnw.cmd`）
- JDK 17
- PostgreSQL 数据库实例

---

## 目录结构

主要目录结构如下（只列出关键部分）：

```text
Market/
├─ backend/                     # 后端 Spring Boot 服务
│  ├─ src/main/java/com/campus/market/
│  │  ├─ CampusMarketApplication.java
│  │  ├─ auth/                  # 鉴权与用户登录
│  │  ├─ product/               # 商品领域（实体、Service、Controller、Repository）
│  │  ├─ order/                 # 订单相关
│  │  ├─ chat/                  # 聊天会话与消息
│  │  ├─ favorite/              # 收藏相关
│  │  ├─ user/                  # 用户与个人资料
│  │  └─ ...
│  ├─ src/main/resources/
│  │  ├─ application.yml        # Spring Boot 配置（数据库等）
│  │  └─ ...
│  └─ pom.xml
│
├─ src/                         # 前端 React 源码（Vite）
│  ├─ pages/                    # 页面级组件
│  │  ├─ Home.jsx               # 首页
│  │  ├─ Marketplace.jsx        # 发现好物 / 市场列表
│  │  ├─ ProductDetail.jsx      # 商品详情
│  │  ├─ Publish.jsx            # 发布商品
│  │  ├─ MyProducts.jsx         # 我的商品
│  │  ├─ MyFavorites.jsx        # 我的收藏
│  │  ├─ MyOrders.jsx           # 我的订单
│  │  ├─ UserProfile.jsx        # 用户主页
│  │  ├─ Chat.jsx               # 聊天页
│  │  └─ ...
│  ├─ components/               # 通用组件（导航栏、弹窗、卡片等）
│  ├─ api/                      # Axios 封装的后端接口
│  │  └─ index.js
│  ├─ assets/                   # 静态资源（动画、图片等）
│  ├─ lib/                      # 工具函数
│  ├─ App.jsx                   # 路由入口
│  ├─ main.jsx                  # 应用入口
│  └─ index.css                 # 全局样式
│
├─ public/                      # 前端静态资源（通过 Vite 提供）
├─ package.json                 # 前端依赖与脚本
├─ vite.config.js               # Vite 配置
├─ tailwind.config.js           # Tailwind 配置
└─ postcss.config.js
```

---

## 环境准备

### 必备环境

- **Node.js**：推荐 18+（保证与 Vite 兼容）
- **npm**：随 Node 一起安装（推荐 9+）
- **JDK**：17
- **PostgreSQL**：13+（本地或远程均可）

### 数据库配置

1. 创建数据库，例如：`campus_market`。
2. 在 `backend/src/main/resources/application.yml` 中配置：
   - 数据库 URL
   - 用户名 / 密码
   - 连接池等参数
3. 确保数据库编码为 UTF-8。
4. 如项目包含初始化 SQL（schema / data），按说明在数据库中执行。

> 如果本仓库中已经包含 `application.yml` 示例，请根据自己的环境进行修改，不要提交包含真实密码的配置。

---

## 启动方式

项目提供了同时启动前后端的一键脚本，也支持分别启动。

### 一键启动前后端（推荐开发环境）

在项目根目录执行：

```bash
npm install     # 首次运行需要安装依赖
npm run dev:all
```

说明：
- `dev:all` 使用 `concurrently` 同时启动：
  - 后端：`npm run dev:server`
  - 前端：`npm run dev:delay`（延迟 8 秒再启动 Vite，避免后端未就绪）
- 启动成功后：
  - 后端默认监听：`http://localhost:8080`
  - 前端默认访问：`http://localhost:5173`

### 单独启动后端

```bash
cd backend
mvnw.cmd spring-boot:run
```

说明：
- 使用 Maven Wrapper，无需本地安装 Maven。
- 如需跳过测试，可在命令后追加 `-DskipTests`。

### 单独启动前端

在项目根目录：

```bash
npm install   # 如未安装依赖
npm run dev
```

默认会在 `http://localhost:5173` 启动 Vite 开发服务器。

---

## 构建与部署

### 前端构建

```bash
npm run build
```

输出目录：`dist/`，可部署到任意静态资源服务器（Nginx、静态空间等）。

常见部署方式：
- 独立部署前端，配置反向代理将 `/api` 转发到后端 `8080` 端口。
- 或将构建结果拷贝到后端的静态目录（如使用 Nginx 统一托管）。

### 后端打包

在 `backend/` 目录下：

```bash
cd backend
mvnw.cmd clean package
```

成功后会生成 `target/campus-market-backend-*.jar`，可通过：

```bash
java -jar target/campus-market-backend-*.jar
```

进行部署（如服务器 / Docker 容器中）。

---

## 主要脚本说明（package.json）

```json
"scripts": {
  "dev": "vite",                         // 启动前端开发服务器
  "dev:server": "cd backend && mvnw.cmd spring-boot:run",  // 启动后端
  "dev:all": "concurrently -n \"后端,前端\" -c \"yellow,cyan\" \"npm run dev:server\" \"npm run dev:delay\"",
  "dev:delay": "node -e \"setTimeout(() => require('child_process').spawn('npm', ['run', 'dev'], {stdio: 'inherit', shell: true}), 8000)\"",
  "build": "vite build",                 // 前端打包
  "lint": "eslint .",                    // 代码检查
  "preview": "vite preview"              // 本地预览打包后的前端
}
```

---

## API 概览（部分）

> 这里只列出与商品相关的核心接口，详细以后端代码为准（`backend/src/main/java/com/campus/market/product`）。

- `GET /api/products`：商品列表
  - 支持参数：`categoryId`、`keyword`、`sort`（`latest` / `priceAsc` / `priceDesc` / `viewDesc`）、`page`、`size`
- `GET /api/products/latest`：最新发布的商品列表（首页 / 推荐使用）
- `GET /api/products/{id}`：获取商品详情
- `POST /api/products`：创建商品
- `PUT /api/products/{id}`：更新商品
- `DELETE /api/products/{id}`：删除商品
- `PATCH /api/products/{id}/status`：更新商品状态（上架 / 下架 / 已售 / 删除）
- `POST /api/products/{id}/view`：浏览量 +1（详情页加载时调用）

其他模块（用户、订单、聊天、收藏等）接口定义请参考对应包下的 `Controller` 类。

---

## 常见问题（FAQ）

### 1. `npm run dev:all` 启动失败怎么办？

- 确认：
  - JDK 17 已正确安装，`java -version` 输出版本 >= 17。
  - 数据库配置正确，PostgreSQL 已启动且能连接。
- 可以尝试分步启动：
  1. 先在 `backend/` 中运行 `mvnw.cmd spring-boot:run`，确认后端启动正常；
  2. 然后在根目录运行 `npm run dev` 启动前端。

### 2. 浏览器访问接口报 CORS 问题？

- 检查后端是否配置了跨域（通常在 `config` 包内）。
- 确保前端访问的 API 地址与后端配置保持一致（如通过 Vite 代理 `/api`）。

### 3. 数据库连不上 / 表不存在？

- 检查 `application.yml` 中的数据库地址、库名、用户名和密码。
- 如项目提供了建表 SQL，请先在数据库中执行初始化脚本。

---

## 贡献与开发约定

- **分支策略**：建议在 feature 分支上开发，测试稳定后合并到主分支。
- **代码风格**：
  - 前端遵循 ESLint 规则，提交前可运行 `npm run lint`。
  - 后端遵循 Spring Boot / Java 17 常规规范，使用 Lombok 简化样板代码。
- **提交信息**：建议使用清晰的动词开头，例如：`feat: 添加浏览量排序`、`fix: 修复详情页空指针` 等。

---

## 后续可优化方向

- 接入对象存储（OSS / COS 等）托管图片
- 补充更多单元测试与集成测试
- 聊天模块接入 WebSocket 实时通信
- 增加运营统计与后台管理页面

如在使用或二次开发过程中遇到问题，可以根据报错信息定位到对应前后端模块进行排查。
