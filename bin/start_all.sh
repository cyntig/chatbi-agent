#!/bin/bash

# ChatBI 全服务启动脚本
# 同时启动前端、后端和 MCP 服务

echo "🚀 启动 ChatBI 完整系统..."
echo ""

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 检查是否已经运行了服务
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 8000 已被占用，后端服务可能已在运行"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，前端服务可能已在运行"
fi

echo "📋 启动计划："
echo "  1. MCP 服务 (数据分析和图表)"
echo "  2. 后端 API 服务 (端口 8000)"
echo "  3. 前端 Web 服务 (端口 3000)"
echo ""

# 启动 MCP 服务
echo "🔌 [1/3] 启动 MCP 服务..."
cd "$PROJECT_DIR/bankend/src"

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3"
    exit 1
fi

# 后台启动 MCP 服务
python3 -m mcp_servers.chatbi_server > "$PROJECT_DIR/logs/mcp_server.log" 2>&1 &
MCP_PID=$!
echo "✅ MCP 服务已启动 (PID: $MCP_PID)"

# 保存 MCP PID 到文件，方便停止
echo $MCP_PID > "$PROJECT_DIR/logs/mcp_server.pid"

# 等待 MCP 服务启动
echo "⏳ 等待 MCP 服务启动..."
sleep 2
if ps -p $MCP_PID > /dev/null; then
    echo "✅ MCP 服务就绪"
else
    echo "❌ MCP 服务启动失败"
    exit 1
fi

echo ""

# 启动后端服务
echo "🔧 [2/3] 启动后端服务..."

# 后台启动后端服务
python3 main.py > "$PROJECT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 保存后端 PID 到文件
echo $BACKEND_PID > "$PROJECT_DIR/logs/backend.pid"

# 等待后端服务启动
echo "⏳ 等待后端服务启动..."
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ 后端服务就绪"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ 后端服务启动超时"
        kill $MCP_PID $BACKEND_PID 2>/dev/null
        rm -f "$PROJECT_DIR/logs/mcp_server.pid" "$PROJECT_DIR/logs/backend.pid"
        exit 1
    fi
    sleep 1
done

echo ""

# 启动前端服务
echo "🎨 [3/3] 启动前端服务..."
cd "$PROJECT_DIR/frontend"

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install -q
fi

echo ""
echo "🎉 ChatBI 系统启动完成！"
echo ""
echo "📍 访问地址："
echo "  • 前端应用: http://localhost:3000"
echo "  • 后端API: http://localhost:8000"
echo "  • API文档: http://localhost:8000/docs"
echo ""
echo "🔧 运行服务："
echo "  • MCP 服务 (PID: $MCP_PID)"
echo "  • 后端服务 (PID: $BACKEND_PID)"
echo ""
echo "💡 提示："
echo "  • MCP 日志: $PROJECT_DIR/logs/mcp_server.log"
echo "  • 后端日志: $PROJECT_DIR/logs/backend.log"
echo "  • 按 Ctrl+C 停止所有服务"
echo ""

# 设置 trap 来清理进程
trap "echo ''; echo '🛑 正在停止服务...'; kill $MCP_PID $BACKEND_PID 2>/dev/null; rm -f '$PROJECT_DIR/logs/mcp_server.pid' '$PROJECT_DIR/logs/backend.pid'; exit 0" INT TERM

# 启动前端服务（前台运行）
npm run dev

# 清理
echo "🛑 停止所有服务..."
kill $MCP_PID $BACKEND_PID 2>/dev/null
rm -f "$PROJECT_DIR/logs/mcp_server.pid" "$PROJECT_DIR/logs/backend.pid"
echo "✅ 所有服务已停止"
