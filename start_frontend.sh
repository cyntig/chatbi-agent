#!/bin/bash

# ChatBI 前端启动脚本

echo "🚀 启动 ChatBI 前端服务..."
echo "📦 Node.js 版本: $(node -v)"
echo "📦 npm 版本: $(npm -v)"
echo ""
echo "📍 前端地址: http://127.0.0.1:3000"
echo "🔧 后端API: http://127.0.0.1:8000"
echo "📚 API文档: http://127.0.0.1:8000/docs"
echo ""
echo "⏳ 正在启动开发服务器..."
echo "💡 提示: 按 Ctrl+C 停止服务"
echo ""

# 进入前端目录
cd "$(dirname "$0")/frontend" || exit 1

# 启动开发服务器
npm run dev
