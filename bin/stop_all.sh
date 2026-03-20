#!/bin/bash

# ChatBI 服务停止脚本

echo "🛑 停止 ChatBI 服务..."

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 停止 MCP 服务
MCP_PID_FILE="$PROJECT_DIR/logs/mcp_server.pid"
if [ -f "$MCP_PID_FILE" ]; then
    MCP_PID=$(cat "$MCP_PID_FILE")
    if ps -p $MCP_PID > /dev/null 2>&1; then
        echo "🔌 停止 MCP 服务 (PID: $MCP_PID)..."
        kill $MCP_PID 2>/dev/null
        sleep 1
        # 强制停止如果还在运行
        if ps -p $MCP_PID > /dev/null 2>&1; then
            kill -9 $MCP_PID 2>/dev/null
        fi
        echo "✅ MCP 服务已停止"
    else
        echo "ℹ️  MCP 服务未运行 (PID 文件存在但进程不存在)"
    fi
    rm -f "$MCP_PID_FILE"
else
    # 尝试通过进程名停止
    MCP_PIDS=$(pgrep -f "mcp_servers.chatbi_server" 2>/dev/null)
    if [ -n "$MCP_PIDS" ]; then
        echo "🔌 停止 MCP 服务..."
        pkill -f "mcp_servers.chatbi_server" 2>/dev/null
        sleep 1
        echo "✅ MCP 服务已停止"
    else
        echo "ℹ️  MCP 服务未运行"
    fi
fi

# 停止后端服务 (端口 8000)
BACKEND_PID_FILE="$PROJECT_DIR/logs/backend.pid"
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🔧 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        # 强制停止如果还在运行
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  后端服务未运行 (PID 文件存在但进程不存在)"
    fi
    rm -f "$BACKEND_PID_FILE"
else
    BACKEND_PID=$(lsof -ti :8000 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        echo "🔧 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        # 强制停止如果还在运行
        if lsof -ti :8000 >/dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  后端服务未运行"
    fi
fi

# 停止前端服务 (端口 3000)
FRONTEND_PID=$(lsof -ti :3000 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
    echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    sleep 1
    # 强制停止如果还在运行
    if lsof -ti :3000 >/dev/null 2>&1; then
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ 前端服务已停止"
else
    echo "ℹ️  前端服务未运行"
fi

echo ""
echo "✅ 所有服务已停止"

# 显示剩余的进程（如果有）
REMAINING=$(lsof -ti :3000 :8000 2>/dev/null)
if [ -n "$REMAINING" ]; then
    echo "⚠️  仍有进程占用端口:"
    lsof -i :3000 :8000 | grep LISTEN
fi

# 检查是否还有 MCP 相关进程
REMAINING_MCP=$(pgrep -f "mcp_servers.chatbi_server" 2>/dev/null)
if [ -n "$REMAINING_MCP" ]; then
    echo "⚠️  仍有 MCP 服务进程运行:"
    ps aux | grep "mcp_servers.chatbi_server" | grep -v grep
fi
