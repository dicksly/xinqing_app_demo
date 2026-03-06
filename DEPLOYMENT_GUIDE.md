# 免费部署指南 - Vercel + Render

本指南将详细介绍如何使用 Vercel（前端）和 Render（后端）免费部署心情疗愈 App。

---

## 📋 部署前准备

### 1. GitHub 仓库准备

#### 将代码推送到 GitHub

```bash
# 1. 在 GitHub 创建新仓库（例如：xinqing-app）

# 2. 初始化 Git 仓库（如果还没有）
cd xinqing_app_demo
git init

# 3. 添加远程仓库
git remote add origin https://github.com/your-username/xinqing-app.git

# 4. 提交代码
git add .
git commit -m "Initial commit"

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

### 2. 项目结构调整

由于 Render 需要 `backend/` 目录下有一个 `requirements.txt`，我们需要调整项目结构。

#### 选项 A：使用 Monorepo（推荐）

保持当前结构不变，使用不同的 GitHub 仓库：

```
your-github/
├── xinqing-frontend/     # 前端代码
└── xinqing-backend/      # 后端代码
```

#### 选项 B：调整项目结构（本指南使用）

保持当前结构，但为 Render 添加配置文件。

---

## 🎨 部署前端（Vercel）

### 步骤 1：注册 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号注册
3. 完成邮箱验证

### 步骤 2：创建新项目

1. 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 选择你的 `xinqing-app` 仓库
4. 配置项目设置：

   **Framework Preset**: Other
   **Root Directory**: `frontend`
   **Build Command**: `npm run build`
   **Output Directory**: `dist`

### 步骤 3：环境变量配置

在 "Environment Variables" 部分，添加：

```
VITE_API_BASE_URL=https://your-backend-app.onrender.com
```

> **注意**：先部署后端，获取 Render 提供的 URL，然后再配置前端的环境变量。

### 步骤 4：部署

1. 点击 "Deploy" 按钮
2. 等待部署完成（通常 1-2 分钟）
3. 部署完成后，Vercel 会提供一个 URL（例如：https://xinqing-app.vercel.app）

### 步骤 5：配置自定义域名（可选）

1. 进入项目 → Settings → Domains
2. 添加自定义域名
3. 根据提示配置 DNS

---

## 🚀 部署后端（Render）

### 步骤 1：注册 Render

1. 访问 [render.com](https://render.com)
2. 使用 GitHub 账号注册
3. 完成邮箱验证

### 步骤 2：创建 Web Service

1. 点击 "New +" → "Web Service"
2. 选择 "Build and deploy from a Git repository"
3. 选择你的 `xinqing-app` 仓库
4. 配置构建和启动设置：

   **构建和运行**

   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

   **环境**

   - **Environment**: `Python 3`
   - **Instance Type**: `Free`（免费版）

### 步骤 3：环境变量配置

在 "Environment" 部分，添加以下变量：

```
APP_NAME=心情疗愈 App
DEBUG=False
DATABASE_URL=sqlite:///./xinqing.db
SECRET_KEY=your-production-secret-key-change-this
ENCRYPTION_KEY=your-production-encryption-key-change-this
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

> **重要**：
> - `SECRET_KEY` 和 `ENCRYPTION_KEY` 必须使用强随机字符串
> - `ALLOWED_ORIGINS` 必须包含前端域名
> - 可以使用在线工具生成随机密钥：[https://randomkeygen.com/](https://randomkeygen.com/)

### 步骤 4：持久存储配置

Render 的免费套餐默认重启后会丢失数据，我们需要配置持久存储。

1. 在 Render Dashboard 中，进入你的服务
2. 点击 "Persistent Disk" 标签页
3. 添加持久磁盘：
   - **类型**: `SSD`
   - **大小**: `1 GB`（最小，足够 SQLite 数据库使用）
   - **挂载路径**: `/opt/render/project`

4. 修改后端代码以使用持久存储：

创建 `backend/app/core/persistent.py`：

```python
"""
持久化存储配置
"""

import os
from pathlib import Path

# Render 持久化存储路径
PERSISTENT_DIR = Path("/opt/render/project")

# 确保目录存在
PERSISTENT_DIR.mkdir(parents=True, exist_ok=True)

# 数据库文件路径
DATABASE_PATH = PERSISTENT_DIR / "xinqing.db"
```

然后修改 `backend/main.py`：

```python
from app.core.database import engine, Base
from app.core.config import settings

# 覆盖数据库路径
import sys
sys.path.insert(0, '/app')

try:
    from app.core.persistent import DATABASE_PATH
    # 如果使用持久存储，修改数据库 URL
    if DATABASE_PATH.exists():
        settings.DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
except ImportError:
    pass  # 开发环境，使用默认路径
```

### 步骤 5：部署

1. 点击 "Create Web Service" 按钮
2. 等待构建和部署完成（通常 2-3 分钟）
3. 部署完成后，Render 会提供一个 URL（例如：https://xinqing-backend.onrender.com）

### 步骤 6：获取后端 URL

1. 在 Render Dashboard 中找到你的服务
2. 复制服务的 URL
3. 将这个 URL 配置到 Vercel 的环境变量中

---

## 🔗 配置前后端连接

### 1. 更新前端环境变量

回到 Vercel 项目：

1. 进入项目 → Settings → Environment Variables
2. 更新 `VITE_API_BASE_URL`：
   ```
   VITE_API_BASE_URL=https://your-backend-app.onrender.com
   ```
3. 重新部署前端（会自动触发）

### 2. 更新后端 CORS 配置

在 Render 中，更新环境变量：

```
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

重新部署后端。

---

## 🌍 访问你的应用

### 部署完成后

访问前端 Vercel 提供的 URL（例如：https://xinqing-app.vercel.app）

你的应用现在已经在公网上运行了！

---

## 📊 监控和日志

### Vercel（前端）

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 点击 "Analytics" 查看访问统计
4. 点击 "Logs" 查看部署日志和运行日志

### Render（后端）

1. 进入 Render Dashboard
2. 选择你的服务
3. 点击 "Logs" 查看运行日志
4. 点击 "Metrics" 查看性能指标

---

## 🔧 常见问题和解决方案

### 1. 前端无法访问后端 API

**问题**：前端控制台显示 CORS 错误

**解决方案**：

1. 检查后端环境变量 `ALLOWED_ORIGINS` 是否包含前端域名
2. 确保前端域名格式正确（包括 https://）
3. 重新部署后端

### 2. 数据库数据丢失

**问题**：Render 重启后数据丢失

**解决方案**：

1. 按照上面的步骤配置持久化存储
2. 确保数据库文件路径正确
3. 使用 SQLite 的持久存储功能

### 3. 应用性能较慢

**问题**：免费套餐性能有限

**解决方案**：

1. 优化前端代码（懒加载、代码分割）
2. 优化后端代码（数据库索引、查询优化）
3. 如果需要更好的性能，可以升级到付费套餐

### 4. 域名解析问题

**问题**：自定义域名无法访问

**解决方案**：

1. 检查 DNS 配置是否正确
2. 等待 DNS 生效（最多 24 小时）
3. 确保使用 HTTPS 证书（自动提供）

---

## 💰 升级到付费套餐（可选）

如果你的项目流量增加，可以考虑升级到付费套餐。

### Vercel（前端）

- **Pro**：$20/月，包含更多功能和更快的部署
- **Enterprise**：联系销售获取报价

### Render（后端）

- **Starter**：$7/月，包含更多运行时间
- **Standard**：$25/月，包含更好的性能
- **Pro**：$85/月，包含更多功能

---

## 📝 总结

使用 Vercel + Render 免费部署你的 Vue 3 + FastAPI 项目的步骤：

1. ✅ 准备 GitHub 仓库
2. ✅ 在 Vercel 部署前端
3. ✅ 在 Render 部署后端
4. ✅ 配置环境变量和 CORS
5. ✅ 配置持久化存储
6. ✅ 更新前后端连接
7. ✅ 测试应用

你的应用现在已经在公网上了！🎉
