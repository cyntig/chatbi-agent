#!/bin/bash

# ChatBI MCP 服务启动脚本

echo "🔌 启动 ChatBI MCP 服务..."

# 进入后端目录
cd "$(dirname "$0")/../bankend/src"

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3"
    exit 1
fi

# 显示 Python 版本
PYTHON_VERSION=$(python3 --version)
echo "📦 $PYTHON_VERSION"
echo ""

# 检查必要的依赖
echo "🔍 检查依赖..."
if ! python3 -c "import fastmcp" 2> /dev/null; then
    echo "❌ 缺少 fastmcp 依赖"
    echo "请运行: pip install fastmcp"
    exit 1
fi

if ! python3 -c "import dotenv" 2> /dev/null; then
    echo "❌ 缺少 python-dotenv 依赖"
    echo "请运行: pip install python-dotenv"
    exit 1
fi

echo "✅ 依赖检查完成"
echo ""

# 创建日志目录
LOG_DIR="$(dirname "$0")/../logs"
mkdir -p "$LOG_DIR"

# 启动 MCP 服务
echo "🚀 启动 MCP 服务..."
echo "📋 服务信息:"
echo "  • 服务名称: ChatBI MCP Server"
echo "  • 模块: mcp_servers.chatbi_server"
echo "  • 日志: $LOG_DIR/mcp_server.log"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务"
echo ""

# 启动服务（前台运行，方便查看日志）
python3 -m mcp_servers.chatbi_server
