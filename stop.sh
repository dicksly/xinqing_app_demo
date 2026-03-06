#!/bin/bash

# 心理健康与情绪疗愈 App - 停止服务脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

print_info "======================================="
print_info "心情疗愈 App - 停止服务脚本"
print_info "======================================="
echo ""

# 停止后端服务
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        print_info "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        print_success "后端服务已停止"
    else
        print_warning "后端服务进程不存在"
    fi
    rm -f logs/backend.pid
else
    # 尝试通过端口查找进程
    BACKEND_PID=$(lsof -ti :8000 2>/dev/null || true)
    if [ -n "$BACKEND_PID" ]; then
        print_info "通过端口 8000 找到后端进程 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        print_success "后端服务已停止"
    else
        print_warning "未找到后端服务进程"
    fi
fi

# 停止前端服务
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_info "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        print_success "前端服务已停止"
    else
        print_warning "前端服务进程不存在"
    fi
    rm -f logs/frontend.pid
else
    # 尝试通过端口查找进程
    FRONTEND_PID=$(lsof -ti :3000 2>/dev/null || true)
    if [ -n "$FRONTEND_PID" ]; then
        print_info "通过端口 3000 找到前端进程 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        print_success "前端服务已停止"
    else
        print_warning "未找到前端服务进程"
    fi
fi

echo ""
print_success "======================================="
print_success "所有服务已停止"
print_success "======================================="
echo ""
