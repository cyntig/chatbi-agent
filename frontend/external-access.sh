#!/bin/bash

# ChatBI Agent 外网访问脚本

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 获取本机 IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

# 检查 ngrok 是否安装
check_ngrok() {
    if command -v ngrok &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 安装 ngrok
install_ngrok() {
    log_info "安装 ngrok..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ngrok/ngrok/ngrok
        else
            log_warning "Homebrew 未安装，请手动安装 ngrok"
            log_info "访问: https://ngrok.com/download"
            return 1
        fi
    else
        # Linux
        log_info "请手动安装 ngrok: https://ngrok.com/download"
        return 1
    fi

    log_success "ngrok 安装完成"
}

# 启动本地网络访问
start_local_network() {
    local_ip=$(get_local_ip)
    log_info "本地网络访问已启动！"
    log_success "局域网访问地址: http://${local_ip}:5173"
    log_info "确保设备在同一 WiFi 网络"
}

# 启动 ngrok
start_ngrok() {
    if ! check_ngrok; then
        log_warning "ngrok 未安装"
        read -p "是否要安装 ngrok? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_ngrok
        else
            return 1
        fi
    fi

    log_info "启动 ngrok 外网访问..."

    # 检查是否已配置 authtoken
    if ! ngrok config check &> /dev/null; then
        log_warning "ngrok 未配置"
        log_info "请先配置 authtoken:"
        log_info "1. 访问 https://ngrok.com/ 注册账号"
        log_info "2. 获取 authtoken"
        log_info "3. 运行: ngrok config add-authtoken YOUR_TOKEN"
        return 1
    fi

    # 启动 ngrok
    ngrok http 5173
}

# 显示使用帮助
show_help() {
    cat << EOF
ChatBI Agent 外网访问脚本

用法: ./external-access.sh [选项]

选项:
    local        启动局域网访问
    ngrok        启动 ngrok 外网访问
    install      安装 ngrok
    status       显示当前访问状态
    help         显示此帮助信息

示例:
    ./external-access.sh local      # 局域网访问
    ./external-access.sh ngrok      # 外网访问
    ./external-access.sh install    # 安装 ngrok

访问地址:
    本地:     http://localhost:5173
    局域网:   http://$(get_local_ip):5173
    外网:     通过 ngrok 获取

EOF
}

# 显示状态
show_status() {
    local_ip=$(get_local_ip)

    echo "📊 ChatBI Agent 访问状态"
    echo "────────────────────────────────"
    echo ""
    echo "🖥️  本地访问:"
    echo "   http://localhost:5173"
    echo ""
    echo "🌐 局域网访问:"
    echo "   http://${local_ip}:5173"
    echo ""

    if check_ngrok; then
        echo "🚀 ngrok: 已安装"
        echo "   运行 '$0 ngrok' 启动外网访问"
    else
        echo "❌ ngrok: 未安装"
        echo "   运行 '$0 install' 安装 ngrok"
    fi

    echo ""
    echo "💡 提示:"
    echo "   - 局域网访问: 同一 WiFi 网络内的设备可访问"
    echo "   - 外网访问: 需要使用 ngrok 或部署到云服务器"
}

# 主函数
main() {
    case "${1:-status}" in
        local)
            start_local_network
            ;;
        ngrok)
            start_ngrok
            ;;
        install)
            install_ngrok
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
