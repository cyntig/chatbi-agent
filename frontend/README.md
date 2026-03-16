# ChatBI Agent 前端应用

现代化 Vue 3 + TypeScript 前端应用，用于 ChatBI Agent 的数据分析和可视化界面。

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm 9+

### 安装和启动

```bash
# 克隆项目
git clone <repository-url>
cd frontend

# 安装依赖
npm install

# 启动开发环境
./deploy.sh dev

# 或手动启动
node mock-server.js &  # 启动 Mock API
npm run dev            # 启动前端
```

应用将在 http://localhost:5173 运行

## 📖 功能特性

### 💬 智能聊天
- 实时流式响应
- Markdown 内容渲染
- 代码语法高亮
- 消息历史管理

### 🗂️ 会话管理
- 多会话支持
- 会话搜索和过滤
- 会话导出功能
- 自动保存

### 📊 数据可视化
- 交互式图表（ECharts）
- 数据表格展示
- 统计卡片
- 多格式导出

### 🎨 现代化界面
- 响应式设计
- 深色模式支持
- 流畅动画效果
- 错误处理机制

## 🛠️ 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **类型系统**: TypeScript 5.0+
- **构建工具**: Vite 5.0+
- **UI 组件**: Naive UI
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **图表库**: ECharts + Vue-ECharts
- **HTTP 客户端**: Axios
- **样式方案**: TailwindCSS

## 📦 项目结构

```
frontend/
├── src/
│   ├── components/       # Vue 组件
│   │   ├── chat/        # 聊天相关组件
│   │   ├── dashboard/   # 仪表盘组件
│   │   ├── session/     # 会话管理组件
│   │   └── common/      # 通用组件
│   ├── views/           # 页面视图
│   ├── stores/          # Pinia 状态管理
│   ├── services/        # API 服务层
│   ├── composables/     # 组合式函数
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   └── router/          # 路由配置
├── public/              # 静态资源
└── deploy.sh            # 部署脚本
```

## 🔧 开发指南

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

### 运行测试
```bash
npm run test
```

### 代码检查
```bash
npm run lint
npm run format
```

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动 Docker 构建
```bash
# 构建镜像
docker build -t frontend:latest .

# 运行容器
docker run -d -p 3000:80 frontend:latest
```

## 🌐 环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:8001
VITE_MCP_BASE_URL=http://localhost:8000

# 应用配置
VITE_APP_TITLE=ChatBI Agent
VITE_APP_VERSION=0.1.0

# 功能开关
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_WEBSOCKET=true
```

## 📚 详细文档

- 🚀 [部署指南](./DEPLOYMENT.md)
- 📊 [部署报告](./DEPLOYMENT_REPORT.md)
- 📋 [开发计划](../docs/plans/reflective-toasting-fog.md)

## 🔧 常见问题

### 端口冲突
如果端口被占用，修改 `vite.config.ts` 中的端口号。

### 依赖安装失败
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 构建错误
确保使用 Node.js 18+ 版本，并清理构建缓存。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情

## 📞 技术支持

- 📧 Email: support@chatbi-agent.com
- 🐛 Issues: GitHub Issues
- 📖 Wiki: 项目 Wiki

---

**开发状态**: 🟢 活跃开发中
**当前版本**: v0.1.0
**最后更新**: 2025-03-16
