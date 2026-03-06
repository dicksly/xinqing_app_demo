#!/bin/bash

# 心理健康与情绪疗愈 App - 一键启动脚本

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查是否在项目根目录
if [ ! -f "backend/main.py" ]; then
    print_error "请确保在项目根目录运行此脚本"
    exit 1
fi

# 获取脚本所在目录（即项目根目录）
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_info "====================================="
print_info "心情疗愈 App - 一键启动脚本"
print_info "====================================="
echo ""

# 检查 Python 环境
print_info "检查 Python 环境..."
if ! command -v python3 &> /dev/null; then
    print_error "未找到 Python 3，请先安装 Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
print_success "Python 版本: $PYTHON_VERSION"

# 检查 Node.js 环境
print_info "检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    print_error "未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js 版本: $NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    print_error "未找到 npm"
    exit 1
fi

print_success "npm 版本: $(npm --version)"
echo ""

# 进入后端目录
cd "$PROJECT_DIR/backend"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    print_info "创建 Python 虚拟环境..."
    python3 -m venv venv
    print_success "虚拟环境创建完成"
fi

# 激活虚拟环境
print_info "激活虚拟环境..."
source venv/bin/activate

# 安装后端依赖
print_info "检查后端依赖..."
REQ_HASH_FILE="venv/.requirements_hash"
CURRENT_REQ_HASH=$(shasum -a 256 requirements.txt | awk '{print $1}')
INSTALLED_REQ_HASH=""

if [ -f "$REQ_HASH_FILE" ]; then
    INSTALLED_REQ_HASH=$(cat "$REQ_HASH_FILE")
fi

if [ "$CURRENT_REQ_HASH" != "$INSTALLED_REQ_HASH" ]; then
    print_info "安装后端依赖（首次可能需要几分钟）..."
    pip install -q -r requirements.txt
    echo "$CURRENT_REQ_HASH" > "$REQ_HASH_FILE"
    print_success "后端依赖安装完成"
else
    print_success "后端依赖已安装"
fi

# 回到项目根目录
cd "$PROJECT_DIR"

# 检查前端依赖
print_info "检查前端依赖..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    print_info "安装前端依赖（首次可能需要几分钟）..."
    npm install
    print_success "前端依赖安装完成"
else
    print_success "前端依赖已安装"
fi

# 回到项目根目录
cd "$PROJECT_DIR"

# 创建日志目录
mkdir -p logs

# 启动后端服务
print_info "启动后端服务..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate

# 检查后端是否已经在运行
if lsof -Pi :8000 > /dev/null 2>&1; then
    print_warning "后端服务已在端口 8000 运行"
else
    # 后台启动后端服务
    nohup python3 main.py > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    print_success "后端服务已启动 (PID: $BACKEND_PID)"
fi

# 等待后端服务启动
print_info "等待后端服务启动..."
sleep 3

# 检查后端服务是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "后端服务启动成功"
    print_info "后端 API 文档: http://localhost:8000/docs"
else
    print_error "后端服务启动失败，请检查日志: logs/backend.log"
    exit 1
fi

cd "$PROJECT_DIR/frontend"

# 检查前端是否已经在运行
if lsof -Pi :3000 > /dev/null 2>&1; then
    print_warning "前端服务已在端口 3000 运行"
else
    # 后台启动前端服务
    print_info "启动前端服务..."
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    print_success "前端服务已启动 (PID: $FRONTEND_PID)"
fi

# 等待前端服务启动
print_info "等待前端服务启动..."
sleep 5

echo ""
print_success "====================================="
print_success "所有服务启动成功！"
print_success "====================================="
echo ""
print_info "📱 前端地址: http://localhost:3000"
print_info "🔧 后端地址: http://localhost:8000"
print_info "📖 API 文档: http://localhost:8000/docs"
print_info ""
print_info "📝 日志文件:"
print_info "   后端: logs/backend.log"
print_info "   前端: logs/frontend.log"
print_info ""
print_info "🛑 停止服务: bash stop.sh"
print_info ""
