#!/bin/bash

# ChatBI 前端服务启动脚本

echo "🚀 启动 ChatBI 前端服务..."

# 进入前端目录
cd "$(dirname "$0")/../frontend"

# 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "   请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 显示 Node.js 版本
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "📦 Node.js 版本: $NODE_VERSION"
echo "📦 npm 版本: $NPM_VERSION"
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    if [ -f ".env.example" ]; then
        echo "📋 从 .env.example 创建 .env 文件..."
        cp .env.example .env
        echo "✅ .env 文件已创建"
    fi
    echo ""
fi

# 启动开发服务器
echo "📍 前端地址: http://127.0.0.1:3000"
echo "🔧 后端API: http://127.0.0.1:8000"
echo "📚 API文档: http://127.0.0.1:8000/docs"
echo ""
echo "⏳ 正在启动开发服务器..."
echo "💡 提示: 按 Ctrl+C 停止服务"
echo ""

npm run dev
