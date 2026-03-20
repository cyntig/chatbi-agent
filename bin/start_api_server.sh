#!/bin/bash

# ChatBI API 服务器启动脚本

echo "🚀 启动 ChatBI API 服务器..."

# 进入后端目录
cd "$(dirname "$0")/../bankend/src"

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3"
    exit 1
fi

# 检查是否安装了依赖
if ! python3 -c "import fastapi" 2> /dev/null; then
    echo "📦 安装依赖..."
    pip install -q -r ../../requirements.txt
fi

# 启动服务器
echo "📍 服务器地址: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""

python3 main.py
