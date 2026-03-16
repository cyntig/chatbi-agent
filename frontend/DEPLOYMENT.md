# ChatBI Agent 前端部署指南

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [故障排除](#故障排除)

---

## 🔧 环境要求

### 基础要求
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Python**: 3.10+ (用于后端 BFF，可选)
- **Docker**: 20.x+ (用于容器化部署)

### 可选要求
- **PostgreSQL**: 15.x (数据库)
- **Redis**: 7.x (缓存，可选)

---

## 🚀 快速开始

### 1. 克隆项目
```bash
cd frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件配置
```

### 4. 启动开发服务器
```bash
./deploy.sh dev
```

应用将在以下地址运行：
- **前端**: http://localhost:5173
- **Mock API**: http://localhost:8001

---

## 💻 开发环境部署

### 方式一：使用部署脚本（推荐）

```bash
# 启动开发环境
./deploy.sh dev

# 停止开发环境
./deploy.sh stop
```

### 方式二：手动启动

#### 1. 启动 Mock BFF 服务器
```bash
# 安装 mock 服务器依赖
npm install express cors uuid

# 启动服务器
node mock-server.js
```

#### 2. 启动前端开发服务器
```bash
# 新终端窗口
npm run dev
```

### 开发工具
- **Vue DevTools**: 浏览器扩展，用于 Vue 3 调试
- **Network Tab**: 查看 API 请求和响应
- **Console**: 查看应用日志

---

## 🏭 生产环境部署

### 1. 构建生产版本

```bash
# 构建前端
npm run build

# 输出目录: dist/
```

### 2. 使用部署脚本

```bash
# 生产部署
./deploy.sh deploy
```

### 3. 手动部署步骤

#### 构建配置
在 `vite.config.ts` 中配置生产环境：

```typescript
export default defineConfig({
  base: '/', // 或你的 CDN 路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    // ... 其他配置
  }
})
```

#### 环境变量
创建 `.env.production`:
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_MCP_BASE_URL=https://mcp.yourdomain.com
VITE_APP_TITLE=ChatBI Agent
VITE_APP_VERSION=1.0.0
```

#### 构建
```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

---

## 🐳 Docker 部署

### 1. 使用 Docker Compose（推荐）

```bash
# 启动所有服务
./deploy.sh docker

# 或直接使用 docker-compose
docker-compose up -d
```

这将启动：
- **前端应用**: http://localhost:3000
- **BFF API**: http://localhost:8001
- **MCP Server**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 2. 手动 Docker 构建

#### 构建镜像
```bash
# 前端镜像
docker build -t frontend:latest .

# BFF 服务器镜像
docker build -f Dockerfile.bff -t chatbi-bff:latest .
```

#### 运行容器
```bash
# 前端
docker run -d -p 3000:80 frontend:latest

# BFF 服务器
docker run -d -p 8001:8001 chatbi-bff:latest
```

### 3. Docker 部署到云服务

#### 推送到 Docker Hub
```bash
# 标记镜像
docker tag frontend:latest your-username/frontend:latest

# 推送
docker push your-username/frontend:latest
```

#### 部署到云平台
- **AWS ECS**: 使用 Fargate 或 EC2
- **Google Cloud Run**: 完全托管的无服务器部署
- **Azure Container Instances**: 简单的容器托管
- **Heroku**: 简单的 PaaS 部署
- **DigitalOcean App Platform**: 简单的应用托管

---

## ⚙️ 环境变量配置

### 前端环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | API 基础 URL | `http://localhost:8001` | 是 |
| `VITE_MCP_BASE_URL` | MCP 服务器 URL | `http://localhost:8000` | 是 |
| `VITE_APP_TITLE` | 应用标题 | `ChatBI Agent` | 否 |
| `VITE_APP_VERSION` | 应用版本 | `0.1.0` | 否 |
| `VITE_ENABLE_DARK_MODE` | 启用深色模式 | `true` | 否 |
| `VITE_ENABLE_WEBSOCKET` | 启用 WebSocket | `true` | 否 |

### 后端环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `PORT` | 服务器端口 | `8001` | 否 |
| `NODE_ENV` | 运行环境 | `development` | 否 |
| `MCP_SERVER_URL` | MCP 服务器 URL | `http://localhost:8000` | 是 |
| `DATABASE_URL` | 数据库连接字符串 | - | 是 |
| `LOG_LEVEL` | 日志级别 | `info` | 否 |
| `CORS_ORIGIN` | CORS 允许的源 | `*` | 否 |

---

## 🔍 故障排除

### 常见问题

#### 1. 端口冲突
**问题**: `Error: listen EADDRINUSE: address already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或更改端口配置
```

#### 2. 依赖安装失败
**问题**: `npm install` 失败

**解决**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### 3. Docker 构建失败
**问题**: Docker 构建错误

**解决**:
```bash
# 清理 Docker 缓存
docker system prune -a

# 使用 --no-cache 构建
docker build --no-cache -t frontend .
```

#### 4. API 连接失败
**问题**: 前端无法连接到 API

**解决**:
```bash
# 检查 mock 服务器是否运行
curl http://localhost:8001/health

# 检查 CORS 配置
# 查看 vite.config.ts 中的 proxy 设置
```

#### 5. 构建后页面空白
**问题**: 生产构建后页面显示空白

**解决**:
```bash
# 检查 base 路径配置
# 确保 nginx 配置正确
# 检查浏览器控制台错误

# 本地测试构建
npm run preview
```

### 日志调试

#### 前端日志
```bash
# 开发环境
npm run dev

# 生产日志（浏览器控制台）
# F12 -> Console tab
```

#### 后端日志
```bash
# Mock 服务器
node mock-server.js

# 或使用 PM2
pm2 start mock-server.js --name chatbi-bff
pm2 logs chatbi-bff
```

#### Docker 日志
```bash
# 查看容器日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f frontend
```

---

## 📊 监控和维护

### 健康检查

```bash
# 使用部署脚本
./deploy.sh health

# 手动检查
curl http://localhost:8001/health
curl http://localhost:5173
```

### 性能监控

建议工具：
- **Google Lighthouse**: 性能审计
- **Sentry**: 错误追踪
- **Google Analytics**: 用户分析
- **New Relic**: APM 监控

### 备份策略

```bash
# 备份环境变量
cp .env.local .env.local.backup

# 备份数据库（如果使用）
pg_dump chatbi > backup.sql

# Docker 卷备份
docker run --rm -v chatbi_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## 🔐 安全建议

### 生产环境安全

1. **环境变量保护**
   ```bash
   # 不要将 .env.local 提交到 git
   echo ".env.local" >> .gitignore
   ```

2. **CORS 配置**
   ```javascript
   // 仅允许特定域名
   cors({
     origin: ['https://yourdomain.com']
   })
   ```

3. **HTTPS 配置**
   ```nginx
   # nginx.conf
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

4. **依赖更新**
   ```bash
   # 定期更新依赖
   npm update
   npm audit fix
   ```

---

## 📞 支持

如有问题，请联系：
- **项目 Issues**: GitHub Issues
- **文档**: 查看项目 README.md
- **邮件**: support@chatbi-agent.com

---

**最后更新**: 2025-03-16
**版本**: 0.1.0