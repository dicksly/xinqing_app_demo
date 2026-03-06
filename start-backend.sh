#!/bin/bash

# 启动后端服务

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

cd "$PROJECT_DIR/backend"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    print_info "创建 Python 虚拟环境..."
    python3 -m venv venv
    print_success "虚拟环境创建完成"
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
print_info "检查后端依赖..."
if [ ! -f "venv/.requirements_installed" ]; then
    print_info "安装后端依赖..."
    pip install -q -r requirements.txt
    touch venv/.requirements_installed
    print_success "后端依赖安装完成"
else
    print_info "后端依赖已安装"
fi

# 创建日志目录
mkdir -p logs

# 启动服务
print_info "启动后端服务..."
python3 main.py
