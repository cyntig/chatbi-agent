# ChatBI 快速参考

## 🚀 快速启动

```bash
# 启动所有服务（推荐）
./bin/start_all.sh

# 启动单个服务
./bin/start_mcp.sh          # MCP 服务
./bin/start_api_server.sh   # 后端 API
./bin/start_frontend.sh     # 前端界面
```

## 🛑 服务管理

```bash
# 停止所有服务
./bin/stop_all.sh

# 检查服务状态
./bin/status.sh
```

## 🌐 服务地址

- **前端**: http://localhost:3000
- **后端**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 📋 服务列表

| 服务 | 端口 | 日志文件 |
|------|------|----------|
| MCP 服务 | - | logs/mcp_server.log |
| 后端 API | 8000 | logs/backend.log |
| 前端界面 | 3000 | 控制台 |

## 🔧 常用命令

```bash
# 查看进程
lsof -i :8000    # 后端
lsof -i :3000    # 前端

# 查看日志
tail -f logs/backend.log
tail -f logs/mcp_server.log

# 停止特定端口
kill $(lsof -ti :8000)
kill $(lsof -ti :3000)
```

## ⚠️ 故障排除

**端口被占用？**
```bash
./bin/stop_all.sh
```

**依赖缺失？**
```bash
# 前端
cd frontend && npm install

# 后端
cd bankend && pip install -r requirements.txt
```

**服务异常？**
```bash
# 查看详细日志
tail -f logs/backend.log
tail -f logs/mcp_server.log

# 重启服务
./bin/stop_all.sh
./bin/start_all.sh
```
