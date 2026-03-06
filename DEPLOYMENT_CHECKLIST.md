# 免费部署清单 - Vercel + Render

## ✅ 部署前准备清单

### GitHub 仓库
- [ ] 在 GitHub 创建新仓库（例如：xinqing-app）
- [ ] 将代码推送到 GitHub
- [ ] 确保仓库是公开的（或者你有访问权限）

### 环境准备
- [ ] GitHub 账号（用于 Vercel 和 Render 登录）
- [ ] 邮箱地址（用于注册 Vercel 和 Render）
- [ ] 可选：自定义域名（如果需要）

---

## 🚨 部署前检查清单

### 项目文件检查
- [ ] `backend/requirements.txt` 存在
- [ ] `backend/Dockerfile` 存在
- [ ] `backend/.env.production` 存在
- [ ] `frontend/package.json` 存在
- [ ] `frontend/vercel.json` 存在
- [ ] `frontend/.env.production` 存在

### 配置文件检查
- [ ] 已修改 `backend/.env.production` 中的密钥
  - [ ] `SECRET_KEY`（至少 32 位随机字符串）
  - [ ] `ENCRYPTION_KEY`（至少 32 位随机字符串）
- [ ] 已设置 `ALLOWED_ORIGINS`（暂时可以设置为 `*`）
- [ ] 已修改 `frontend/.env.production` 中的 `VITE_API_BASE_URL`（可以先设为占位符）

### 依赖检查
- [ ] 后端依赖可以在本地成功安装
- [ ] 前端依赖可以在本地成功安装
- [ ] 项目可以在本地成功运行

---

## 🎨 前端部署清单（Vercel）

### 步骤 1：注册 Vercel
- [ ] 访问 https://vercel.com
- [ ] 点击 "Login" 或 "Sign Up"
- [ ] 选择 "Continue with GitHub"
- [ ] 授权 Vercel 访问你的 GitHub 账号

### 步骤 2：创建新项目
- [ ] 登录后，点击 "Add New..." → "Project"
- [ ] 选择 "Import Git Repository"
- [ ] 搜索并选择你的 `xinqing-app` 仓库
- [ ] 点击 "Import" 继续

### 步骤 3：配置项目设置
- [ ] **Project Name**: 输入项目名称（例如：xinqing-app）
- [ ] **Framework Preset**: 选择 "Other"
- [ ] **Root Directory**: 输入 `frontend`
- [ ] **Build Command**: 输入 `npm run build`
- [ ] **Output Directory**: 输入 `dist`
- [ ] 点击 "Create" 按钮

### 步骤 4：配置环境变量
- [ ] 部署完成后，进入项目 → Settings → Environment Variables
- [ ] 添加环境变量：
  - [ ] 名称：`VITE_API_BASE_URL`
  - [ ] 值：暂时输入占位符（例如：`https://xinqing-backend.onrender.com`）
  - [ ] 点击 "Save" 保存
- [ ] 重新部署前端（会自动触发）

### 步骤 5：等待部署完成
- [ ] 等待 Vercel 构建和部署完成（通常 1-2 分钟）
- [ ] 部署完成后，记录 Vercel 提供的 URL（例如：`https://xinqing-app.vercel.app`）

---

## 🔧 后端部署清单（Render）

### 步骤 1：注册 Render
- [ ] 访问 https://render.com
- [ ] 点击 "Sign Up"
- [ ] 选择 "Sign Up with GitHub"
- [ ] 授权 Render 访问你的 GitHub 账号
- [ ] 配置用户信息（用户名、邮箱等）

### 步骤 2：创建 Web Service
- [ ] 登录后，点击 "New +" → "Web Service"
- [ ] 选择 "Build and deploy from a Git repository"
- [ ] 搜索并选择你的 `xinqing-app` 仓库
- [ ] 点击 "Connect" 连接仓库

### 步骤 3：配置构建和运行

#### Build & Run
- [ ] **Name**: 输入服务名称（例如：xinqing-backend）
- [ ] **Region**: 选择 `Singapore` 或 `Oregon`（选择离你最近的）
- [ ] **Branch**: 选择 `main`
- [ ] **Root Directory**: 输入 `backend`
- [ ] **Runtime**: 选择 `Python 3`
- [ ] **Build Command**: 输入 `pip install -r requirements.txt`
- [ ] **Start Command**: 输入 `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Environment
- [ ] **Environment**: 选择 `Python 3`
- [ ] **Instance Type**: 选择 `Free`（免费版）

### 步骤 4：配置环境变量
- [ ] 在 "Advanced" 部分，展开 "Environment Variables"
- [ ] 点击 "Add Environment Variable" 添加以下变量：

| 名称 | 值 | 说明 |
|------|-----|------|
| `APP_NAME` | `心情疗愈 App` | 应用名称 |
| `DEBUG` | `False` | 关闭调试模式 |
| `PORT` | `8000` | 端口 |
| `DATABASE_URL` | `sqlite:////opt/render/project/xinqing.db` | 数据库 URL（持久存储） |
| `SECRET_KEY` | `<your-secret-key>` | 生产密钥（必须修改） |
| `ENCRYPTION_KEY` | `<your-encryption-key>` | 加密密钥（必须修改） |
| `ALLOWED_ORIGINS` | `*` | 允许的跨域来源（可以先设置为 *） |
| `FRONTEND_URL` | `https://xinqing-app.vercel.app` | 前端 URL（先使用占位符） |

> **重要提示**：
> - `SECRET_KEY` 和 `ENCRYPTION_KEY` 必须使用强随机字符串
> - 可以使用 https://randomkeygen.com/ 生成 32 位以上的随机密钥
> - 先将 `ALLOWED_ORIGINS` 设置为 `*`，部署完成后再设置为具体的前端域名

### 步骤 5：配置持久化存储

#### 添加持久磁盘
- [ ] 在 Render Dashboard 中，找到你的服务
- [ ] 点击 "Persistent Disk" 标签页
- [ ] 点击 "Add Disk"
- [ ] **Name**: 输入 `xinqing-storage`
- [ ] **Type**: 选择 `SSD`
- [ ] **Size**: 选择 `1 GB`（最小，足够 SQLite 数据库使用）
- [ ] **Mount Path**: 输入 `/opt/render/project`
- [ ] 点击 "Create Disk"

> **注意**：Render 的免费套餐重启后会丢失数据，配置持久化存储可以避免这个问题。

### 步骤 6：创建 Web Service
- [ ] 确认所有配置都正确
- [ ] 点击 "Create Web Service" 按钮
- [ ] 等待构建和部署完成（通常 2-3 分钟）

### 步骤 7：获取后端 URL
- [ ] 部署完成后，在 Render Dashboard 中找到你的服务
- [ ] 复制服务的 URL（例如：`https://xinqing-backend.onrender.com`）

---

## 🔗 配置前后端连接清单

### 步骤 1：更新后端 CORS 配置
- [ ] 回到 Render，进入你的服务
- [ ] 点击 "Environment" 标签页
- [ ] 展开 "Environment Variables"
- [ ] 找到 `ALLOWED_ORIGINS` 变量
- [ ] 将值更新为：`https://xinqing-app.vercel.app`（使用 Vercel 提供的实际域名）
- [ ] 点击 "Save Changes" 保存
- [ ] 等待服务重新部署（会自动触发）

### 步骤 2：更新前端环境变量
- [ ] 回到 Vercel，进入你的项目
- [ ] 点击 "Settings" → "Environment Variables"
- [ ] 找到 `VITE_API_BASE_URL` 变量
- [ ] 将值更新为：`https://xinqing-backend.onrender.com`（使用 Render 提供的实际 URL）
- [ ] 点击 "Save" 保存
- [ ] 等待前端重新部署（会自动触发）

### 步骤 3：测试连接
- [ ] 访问前端 URL：`https://xinqing-app.vercel.app`
- [ ] 打开浏览器开发者工具（F12）
- [ ] 切换到 Console 标签页
- [ ] 检查是否有 CORS 错误
- [ ] 测试核心功能（情绪打卡、树洞倾诉等）

---

## 🌍 配置自定义域名（可选）

### 前端域名（Vercel）
- [ ] 准备一个自定义域名（例如：`xinqing.yourdomain.com`）
- [ ] 在 Vercel 中，进入项目 → Settings → Domains
- [ ] 点击 "Add Domain"
- [ ] 输入你的域名
- [ ] 按照提示配置 DNS 记录
- [ ] 等待 DNS 生效（最多 24 小时）

### 后端域名（Render）
- [ ] 在 Render Dashboard 中，进入你的服务
- [ ] 点击 "Settings" 标签页
- [ ] 在 "Domain" 部分，点击 "Add Custom Domain"
- [ ] 输入你的域名（例如：`api.xinqing.yourdomain.com`）
- [ ] 按照提示配置 DNS 记录
- [ ] 等待 DNS 生效（最多 24 小时）

---

## 📊 监控和日志清单

### 前端监控（Vercel）
- [ ] 进入 Vercel Dashboard
- [ ] 选择你的项目
- [ ] 点击 "Analytics" 查看访问统计
- [ ] 点击 "Logs" 查看部署日志和运行日志
- [ ] 检查是否有错误或警告

### 后端监控（Render）
- [ ] 进入 Render Dashboard
- [ ] 选择你的服务
- [ ] 点击 "Logs" 查看运行日志
- [ ] 点击 "Metrics" 查看性能指标
- [ ] 检查 CPU、内存、网络使用情况
- [ ] 检查服务是否正常运行

---

## 🎯 部署完成清单

### 最终检查
- [ ] 前端可以正常访问（`https://xinqing-app.vercel.app`）
- [ ] 后端可以正常访问（`https://xinqing-backend.onrender.com`）
- [ ] 前端可以正常调用后端 API
- [ ] 没有 CORS 错误
- [ ] 核心功能可以正常使用
- [ ] 数据可以正常保存和读取
- [ ] AI 功能可以正常工作（如果配置了 AI API）

### 测试功能
- [ ] 情绪气象站：可以打卡并查看数据
- [ ] 正念实验室：可以播放冥想音频
- [ ] 秘密树洞：可以发送倾诉并查看 AI 回应
- [ ] 心灵充电站：可以查看知识和测试

### 性能检查
- [ ] 前端加载速度正常（< 3 秒）
- [ ] 后端 API 响应速度正常（< 500ms）
- [ ] 没有明显的性能问题

---

## 📝 备份和恢复清单

### 数据备份（重要！）
- [ ] 定期导出 SQLite 数据库文件
  - [ ] 在 Render Dashboard 中，进入服务
  - [ ] 点击 "Shell" 标签页
  - [ ] 运行命令：`cp /opt/render/project/xinqing.db /opt/render/project/backup/`
  - [ ] 或者使用 `sftp` 或 `scp` 下载数据库文件
- [ ] 将备份文件保存到本地或其他安全位置

### 配置备份
- [ ] 记录所有环境变量和配置
- [ ] 保存自定义域名的 DNS 配置
- [ ] 保存 SSL 证书（如果使用自定义证书）

---

## 🆘 升级到付费套餐（可选）

### 前端（Vercel）
如果前端流量增加，可以考虑升级：
- [ ] Pro：$20/月，包含更多功能和更快的部署
- [ ] Enterprise：联系销售获取报价

### 后端（Render）
如果后端流量或性能需求增加，可以考虑升级：
- [ ] Starter：$7/月，包含更多运行时间
- [ ] Standard：$25/月，包含更好的性能
- [ ] Pro：$85/月，包含更多功能和更好的性能

---

## 📞 获取帮助清单

如果遇到问题：

### 查看文档
- [ ] Vercel 文档：https://vercel.com/docs
- [ ] Render 文档：https://render.com/docs
- [ ] 本项目文档：`DEPLOYMENT_GUIDE.md` 和 `PROJECT_OVERVIEW.md`

### 查看日志
- [ ] 前端日志：Vercel Dashboard → Logs
- [ ] 后端日志：Render Dashboard → Logs

### 常见问题
- [ ] 查看 `README.md` 中的常见问题部分
- [ ] 查看 GitHub Issues

---

## 🎉 部署成功！

恭喜！你的心理健康与情绪疗愈 App 已经成功部署到公网！

现在你可以：
- ✅ 在全球任何地方访问你的应用
- ✅ 分享给朋友使用
- ✅ 收集用户反馈
- ✅ 持续改进和优化

祝你使用愉快！💝
