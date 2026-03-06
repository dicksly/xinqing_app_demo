#!/bin/bash

# 启动前端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR/frontend"

# 检查依赖
print_info "检查前端依赖..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    print_info "安装前端依赖..."
    npm install
    print_success "前端依赖安装完成"
else
    print_info "前端依赖已安装"
fi

# 启动服务
print_info "启动前端服务..."
npm run dev
