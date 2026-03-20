#!/bin/bash

# ChatBI 服务状态检查脚本

echo "🔍 ChatBI 服务状态检查"
echo "======================"
echo ""

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 检查 MCP 服务
echo "🔌 MCP 服务:"
MCP_PID_FILE="$PROJECT_DIR/logs/mcp_server.pid"
if [ -f "$MCP_PID_FILE" ]; then
    MCP_PID=$(cat "$MCP_PID_FILE")
    if ps -p $MCP_PID > /dev/null 2>&1; then
        echo "  ✅ 运行中 (PID: $MCP_PID)"
        # 显示进程运行时间
        PSTIME=$(ps -p $MCP_PID -o etime= 2>/dev/null | tr -d ' ')
        if [ -n "$PSTIME" ]; then
            echo "  ⏱️  运行时间: $PSTIME"
        fi
    else
        echo "  ❌ 未运行 (PID 文件存在但进程不存在)"
        rm -f "$MCP_PID_FILE"
    fi
else
    MCP_PROCS=$(pgrep -f "mcp_servers.chatbi_server" 2>/dev/null)
    if [ -n "$MCP_PROCS" ]; then
        echo "  ⚠️  运行中 (未通过脚本启动, PIDs: $MCP_PROCS)"
    else
        echo "  ❌ 未运行"
    fi
fi
echo ""

# 检查后端服务
echo "🔧 后端 API 服务:"
BACKEND_PID_FILE="$PROJECT_DIR/logs/backend.pid"
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "  ✅ 运行中 (PID: $BACKEND_PID)"
        # 显示进程运行时间
        PSTIME=$(ps -p $BACKEND_PID -o etime= 2>/dev/null | tr -d ' ')
        if [ -n "$PSTIME" ]; then
            echo "  ⏱️  运行时间: $PSTIME"
        fi
        # 测试健康检查
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "  🌐 健康检查: 通过"
        else
            echo "  ⚠️  健康检查: 失败"
        fi
    else
        echo "  ❌ 未运行 (PID 文件存在但进程不存在)"
        rm -f "$BACKEND_PID_FILE"
    fi
else
    BACKEND_PID=$(lsof -ti :8000 2>/dev/null)
    if [ -n "$BACKEND_PID" ]; then
        echo "  ⚠️  运行中 (未通过脚本启动, PID: $BACKEND_PID)"
    else
        echo "  ❌ 未运行"
    fi
fi
echo ""

# 检查前端服务
echo "🎨 前端 Web 服务:"
FRONTEND_PID=$(lsof -ti :3000 2>/dev/null)
if [ -n "$FRONTEND_PID" ]; then
    echo "  ✅ 运行中 (PID: $FRONTEND_PID)"
    # 显示进程运行时间
    PSTIME=$(ps -p $FRONTEND_PID -o etime= 2>/dev/null | tr -d ' ')
    if [ -n "$PSTIME" ]; then
        echo "  ⏱️  运行时间: $PSTIME"
    fi
else
    echo "  ❌ 未运行"
fi
echo ""

# 总结
echo "📊 服务状态总结:"
RUNNING_COUNT=0

# 统计运行中的服务
if [ -f "$MCP_PID_FILE" ] && ps -p $(cat "$MCP_PID_FILE") > /dev/null 2>&1; then
    ((RUNNING_COUNT++))
elif pgrep -f "mcp_servers.chatbi_server" > /dev/null 2>&1; then
    ((RUNNING_COUNT++))
fi

if [ -f "$BACKEND_PID_FILE" ] && ps -p $(cat "$BACKEND_PID_FILE") > /dev/null 2>&1; then
    ((RUNNING_COUNT++))
elif lsof -ti :8000 > /dev/null 2>&1; then
    ((RUNNING_COUNT++))
fi

if lsof -ti :3000 > /dev/null 2>&1; then
    ((RUNNING_COUNT++))
fi

echo "  运行中: $RUNNING_COUNT/3 个服务"

if [ $RUNNING_COUNT -eq 3 ]; then
    echo "  🎉 所有服务运行正常！"
elif [ $RUNNING_COUNT -eq 0 ]; then
    echo "  💡 提示: 使用 ./bin/start_all.sh 启动所有服务"
else
    echo "  ⚠️  部分服务未运行"
fi

echo ""
echo "🌐 访问地址:"
echo "  前端应用: http://localhost:3000"
echo "  后端API: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
