# ChatBI 启动脚本使用指南

本目录包含 ChatBI 项目的启动和管理脚本。

## 📋 可用脚本

### 🚀 start_all.sh (推荐)
同时启动前端、后端和 MCP 服务

```bash
./bin/start_all.sh
```

**功能：**
- 自动启动 MCP 服务 (数据分析和图表)
- 自动启动后端 API 服务 (端口 8000)
- 自动启动前端 Web 服务 (端口 3000)
- 智能检查服务状态
- 按 Ctrl+C 优雅停止所有服务

### 🔌 start_mcp.sh
仅启动 MCP 服务

```bash
./bin/start_mcp.sh
```

**功能：**
- 启动 ChatBI MCP 服务器
- 提供数据预览和文本转 SQL 工具
- 自动检查 Python 依赖
- 前台运行，方便调试

### 🎨 start_frontend.sh
仅启动前端服务

```bash
./bin/start_frontend.sh
```

**功能：**
- 启动 Vue 3 开发服务器
- 自动检查 Node.js 环境
- 首次运行自动安装依赖
- 自动创建 .env 配置文件

### 🔧 start_api_server.sh
仅启动后端服务

```bash
./bin/start_api_server.sh
```

**功能：**
- 启动 FastAPI 服务器
- 自动检查 Python 环境
- 提供 API 文档访问

### 🛑 stop_all.sh
停止所有服务

```bash
./bin/stop_all.sh
```

**功能：**
- 停止 MCP 服务
- 停止前端服务 (端口 3000)
- 停止后端服务 (端口 8000)
- 智能清理 PID 文件
- 强制清理占用端口的进程

### 🔍 status.sh
检查服务状态

```bash
./bin/status.sh
```

**功能：**
- 显示所有服务的运行状态
- 显示进程运行时间
- 检查服务健康状态
- 提供访问地址和快速链接

## 🌐 服务地址

启动成功后，可以访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 💡 使用建议

### 首次使用
推荐使用 `start_all.sh` 一键启动完整系统：

```bash
cd /Users/monacui/about_src/personal_learning/chatbi-agent
./bin/start_all.sh
```

### 开发调试
如果只需要调试某个服务：

```bash
# 仅启动 MCP 服务
./bin/start_mcp.sh

# 仅启动前端
./bin/start_frontend.sh

# 仅启动后端
./bin/start_api_server.sh
```

### 停止服务
使用统一停止脚本：

```bash
./bin/stop_all.sh
```

### 检查服务状态
查看所有服务的运行状态：

```bash
./bin/status.sh
```

## ⚠️ 常见问题

### 端口被占用
如果看到端口占用错误：

```bash
# 查看占用端口的进程
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 停止所有服务
./bin/stop_all.sh
```

### 依赖未安装
如果提示缺少依赖：

```bash
# 前端依赖
cd frontend && npm install

# 后端依赖
cd bankend && pip install -r requirements.txt
```

### 权限错误
如果脚本无法执行：

```bash
chmod +x bin/*.sh
```

## 📝 日志文件

- MCP 服务日志: `logs/mcp_server.log`
- 后端服务日志: `logs/backend.log`
- 前端服务日志: 控制台输出
- PID 文件: `logs/mcp_server.pid`, `logs/backend.pid`

## 🔄 旧版脚本

以下为保留的旧版脚本，建议使用上面的新脚本：

- `deploy_application.sh` - Chainlit 应用部署
- `deploy_mcp_server.sh` - MCP 服务器部署

## 📚 更多信息

查看项目主文档: [../README.md](../README.md)
