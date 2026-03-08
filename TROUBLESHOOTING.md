# 🔧 Vercel 请求 Render 失败 - 故障排除指南

## 问题描述
前端（Vercel）无法请求后端（Render）服务。

---

## ✅ 已完成的修复

### 1. 前端 API 配置修复
**文件**：`frontend/src/api/index.js`

**修改内容**：
- 添加环境变量支持 `VITE_API_BASE_URL`
- 生产环境使用完整的后端 URL
- 开发环境使用相对路径（代理）

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
```

**说明**：
- ✅ 前端现在会从环境变量读取后端 URL
- ✅ 避免了生产环境的跨域问题

### 2. 后端 CORS 配置增强
**文件**：`backend/app/core/config.py`

**修改内容**：
- 添加 `ALLOWED_ORIGINS` 配置字段
- 支持从环境变量读取 CORS 允许的来源

```python
ALLOWED_ORIGINS: str = "*"  # 默认允许所有来源，生产环境应设置为前端域名
```

---

## 🔍 需要配置的环境变量

### Vercel（前端）环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

```env
VITE_API_BASE_URL=https://your-backend-app.onrender.com
```

**获取后端 URL**：
1. 登录 Render Dashboard
2. 找到你的 Web Service
3. 复制 "Domains" 部分显示的 URL
4. 替换上面的 `your-backend-app.onrender.com`

### Render（后端）环境变量

在 Render Dashboard → Environment Variables 添加：

```env
DEBUG=false
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**说明**：
- `DEBUG=false`：生产环境必须设置为 `false`
- `ALLOWED_ORIGINS`：必须包含前端域名（包括 https://）

---

## 🚀 部署步骤

### 步骤 1：提交修复
```bash
cd /Users/rosengong/workspace/xinqing_app_demo
git add frontend/src/api/index.js backend/app/core/config.py TROUBLESHOOTING.md
git commit -m "fix: 修复生产环境 API 连接和 CORS 配置"
```

### 步骤 2：推送到 GitHub
```bash
git push origin main
```

### 步骤 3：配置 Vercel 环境变量
1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加/更新 `VITE_API_BASE_URL`
5. 重新部署前端（Vercel 会自动触发）

### 步骤 4：配置 Render 环境变量
1. 访问 https://dashboard.render.com
2. 选择你的 Web Service
3. 进入 Environment 标签页
4. 添加/更新环境变量：
   - `DEBUG=false`
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
5. 重新部署后端（手动触发或等待自动部署）

### 步骤 5：验证连接
1. 等待两个平台都部署完成（通常 1-3 分钟）
2. 访问前端 Vercel URL
3. 打开浏览器控制台（F12）
4. 测试功能，查看是否有 API 请求错误

---

## 🐛 常见问题排查

### 问题 1：CORS 错误
**错误信息**：
```
Access to fetch at 'https://backend.onrender.com/api/v1/...' from origin 'https://frontend.vercel.app' 
has been blocked by CORS policy
```

**解决方案**：
1. 检查 Render 环境变量 `ALLOWED_ORIGINS` 是否正确
2. 确保包含完整的域名（包括 https://）
3. 重新部署 Render 服务

### 问题 2：404 Not Found
**错误信息**：
```
Request failed with status code 404
```

**解决方案**：
1. 检查前端环境变量 `VITE_API_BASE_URL` 是否正确
2. 确认 URL 完整（包括 https:// 和域名）
3. 检查后端路由是否正确（`/api/v1/...`）

### 问题 3：Render 服务休眠
**问题**：Render 免费套餐会在 15 分钟无活动后休眠

**解决方案**：
1. 升级到付费套餐（Starter $7/月）
2. 使用外部监控服务（如 UptimeRobot）定期 ping
3. 接受首次请求会有 30-60 秒延迟

### 问题 4：网络超时
**错误信息**：
```
Network Error: timeout of 10000ms exceeded
```

**解决方案**：
1. 检查后端服务是否正常运行（访问 Render Dashboard）
2. 查看 Render 日志是否有错误
3. 增加前端超时时间（修改 `.env.production` 中的 `VITE_API_TIMEOUT`）

---

## 📊 验证清单

部署完成后，检查以下项目：

- [ ] 前端能正常访问（Vercel URL）
- [ ] 后端健康检查正常（访问 `https://backend.onrender.com/health`）
- [ ] 浏览器控制台没有 CORS 错误
- [ ] API 请求返回 200（不是 404 或 500）
- [ ] 能成功登录/注册
- [ ] 能创建情绪记录
- [ ] 数据能正常保存和加载

---

## 📝 调试技巧

### 1. 查看网络请求
浏览器控制台 → Network 标签
- 查看失败的请求（红色）
- 点击请求查看详细信息
- 检查 Request URL 是否正确

### 2. 查看 API 响应
- Response 标签查看返回数据
- 检查状态码（200/400/401/500）
- 查看错误消息

### 3. 查看 Render 日志
Render Dashboard → Logs 标签
- 查看启动日志
- 查看请求日志
- 查看错误堆栈

### 4. 查看 Vercel 日志
Vercel Dashboard → Logs 标签
- 查看构建日志
- 查看运行时日志
- 查看函数调用日志

---

## 🎯 预期结果

完成上述配置后：
- ✅ 前端能正常请求后端 API
- ✅ CORS 错误消失
- ✅ 所有功能正常工作
- ✅ 用户体验流畅

---

## 📞 需要帮助？

如果问题仍然存在：

1. 检查 Render 服务状态：https://status.render.com
2. 检查 Vercel 服务状态：https://www.vercel-status.com
3. 查看项目文档：README.md
4. 提交 Issue 到 GitHub

---

**最后更新**：2026-03-08
