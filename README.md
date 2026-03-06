<div align="center">

![心情疗愈](https://img.shields.io/badge/版本-v1.0.0-brightgreen) ![Vue](https://img.shields.io/badge/Vue-3.4.0-42b883) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688) ![License](https://img.shields.io/badge/许可证-MIT-blue)

</div>

---

# 💝 心情疗愈 App

<div align="center">

**一款专为年轻人设计的轻量级情绪管理与心理疗愈应用**

[功能演示](#功能演示) • [快速开始](#快速开始) • [文档](#文档) • [贡献](#贡献)

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [部署](#部署)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🌟 项目简介

心情疗愈 App 是一款基于 Vue 3 + FastAPI 开发的心理健康与情绪疗愈应用。通过"记录-释放-疗愈-认知"的全链路闭环，帮助用户在快节奏、高压力的生活中，建立自我觉察，缓解负面情绪，并实现去病耻感的心理学知识普及。

### 核心价值

- 🎯 **简单易用**：30秒快速打卡，低门槛记录情绪
- 🛡️ **安全私密**：端到端加密，匿名发布，变声处理
- 🤖 **AI 智能辅助**：风险检测，情感响应，个性化推荐
- 🎨 **治愈系设计**：莫兰迪色系，低饱和度，视觉舒适
- 📊 **数据驱动**：周报分析，情绪趋势，压力源统计

---

## ✨ 功能特性

### 1. 🌟 每日情绪气象站

- **快速打卡**（30秒内完成）
  - 心情选择（5种心情：焦虑、丧、平静、开心、元气）
  - 能量水平滑块（0-100%）
  - 睡眠质量评分（1-5星）

- **智能归因**
  - 压力源标签（工作、人际、家庭、金钱、健康、无原因）
  - 社交意愿选择（独处充电/找人贴贴）

- **微光时刻**
  - 记录小确幸（文字、语音、拍照）
  - 灵感提示词一键获取

- **周报分析**
  - 打卡天数统计
  - 心情分布图
  - 平均能量水平
  - 平均睡眠质量
  - 主要压力源排行
  - 微光时刻数量

### 2. 🧘 正念与放松实验室

- **场景化冥想**
  - 睡眠助眠（帮助进入深度睡眠）
  - 晨间唤醒（开启元气满满的一天）
  - 考前/面试前抗压（提升专注力和信心）
  - 情绪急救（快速平复情绪）
  - 时长选择（3分钟/10分钟/20分钟）
  - 音量控制（人声、背景音独立调节）
  - 背景音类型（白噪音、自然声、阿尔法波音乐）

- **4-7-8 呼吸训练**
  - 科学呼吸法（吸气4秒、屏息7秒、呼气8秒）
  - 动画呼吸圆圈（视觉引导）
  - 震动提示（支持移动端）
  - 步骤说明和训练建议

- **解压小游戏**
  - 捏泡泡纸（释放压力，享受触感）
  - 切肥皂（看着泡沫破裂，烦恼消失）
  - 整理收纳（秩序感带来平静）
  - 曼陀罗涂色（专注当下，创造美好）

### 3. 🌳 秘密树洞

- **匿名倾诉**
  - 文字倾诉（最多1000字）
  - 语音倾诉（支持录音和时长显示）
  - 图片倾诉（记录生活瞬间）
  - 匿名发布选项
  - 变声处理功能（保护隐私）

- **AI 倾听与回应**
  - 共情型 AI 助手
  - 智能情感响应
  - 非评判性语言风格

- **智能风险监测**（P0级关键功能）
  - 高风险关键词识别（自杀、自残等）
  - 中等风险关键词识别（伤害自己、痛苦、绝望等）
  - 分级干预机制
  - 心理援助热线推送（400-161-9995, 021-62798990）
  - 当地危机干预中心联系方式
  - 专业引导和建议

- **公开树洞广场**
  - 匿名条目展示
  - 脱敏处理发布
  - 最新/我的标签切换

### 4. 💡 心灵充电站

- **每日金句**
  - 每日推送治愈系心理学名言
  - 日期显示

- **短视频/条漫**
  - 轻松幽默的科普内容
  - 心理学专业名词解释
  - 心理现象和方法介绍
  - 浏览次数统计

- **心理测试**
  - MBTI 人格类型简化版
  - 压力自测表
  - 依恋类型测试
  - 详细的测试结果分析
  - 可执行的日常建议

- **知识文章**
  - 心理健康知识科普
  - 情绪管理技巧
  - 自我提升方法

- **专题策划**
  - 考试季抗压指南
  - 毕业季迷茫破解
  - 求职季心理建设

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.0 | 渐进式 JavaScript 框架 |
| Vite | 5.1.0 | 下一代前端构建工具 |
| Pinia | 2.1.7 | Vue 状态管理库 |
| Vue Router | 4.2.5 | Vue 官方路由 |
| Axios | 1.6.2 | HTTP 客户端 |
| Element Plus | 2.4.4 | Vue 3 UI 组件库 |
| @element-plus/icons-vue | 2.3.1 | Element Plus 图标库 |

### 后端技术

| 技术 | 版本 | 说明 |
|------|------|------|
| FastAPI | 0.104.1 | 现代、快速的 Web 框架 |
| SQLAlchemy | 2.0.23 | Python SQL 工具包和对象关系映射 |
| Pydantic | 2.5.0 | 数据验证和设置管理 |
| Uvicorn | 0.24.0 | ASGI 服务器 |
| Python Cryptography | 41.0.7 | 加密库 |
| python-multipart | 0.0.6 | 文件上传支持 |

### 数据库

| 技术 | 版本 | 说明 |
|------|------|------|
| SQLite | 3.x | 轻量级嵌入式数据库（本地存储） |

### 开发工具

- Git（版本控制）
- Visual Studio Code（推荐 IDE）
- Chrome DevTools（调试工具）

---

## 📁 项目结构

```
xinqing_app_demo/
├── backend/                           # 后端服务（Python FastAPI）
│   ├── main.py                        # FastAPI 主入口
│   ├── requirements.txt                # Python 依赖文件
│   ├── .env.example                    # 环境变量示例文件
│   └── app/
│       ├── api/
│       │   └── v1/
│       │       └── api.py            # API 路由
│       ├── core/
│       │   ├── config.py              # 配置文件
│       │   └── database.py            # 数据库配置
│       ├── models/
│       │   └── models.py              # 数据库模型
│       ├── schemas/
│       │   └── schemas.py             # Pydantic Schemas
│       └── services/
│           ├── ai_service.py          # AI 服务（风险检测+情感响应）
│           └── emotion_service.py      # 情绪服务
│
├── frontend/                          # 前端应用（Vue 3）
│   ├── index.html                      # HTML 入口文件
│   ├── package.json                    # Node.js 依赖文件
│   ├── vite.config.js                   # Vite 配置文件
│   ├── .env.example                    # 环境变量示例文件
│   └── src/
│       ├── main.js                      # 应用入口
│       ├── App.vue                      # 主组件
│       ├── api/
│       │   └── index.js                # API 服务封装
│       ├── router/
│       │   └── index.js                # 路由配置
│       ├── stores/
│       │   └── emotion.js              # 情绪状态管理
│       ├── views/                       # 页面组件
│       │   ├── emotion/
│       │   │   └── EmotionView.vue      # 情绪气象站
│       │   ├── mindfulness/
│       │   │   └── MindfulnessView.vue  # 正念实验室
│       │   ├── treehole/
│       │   │   └── TreeholeView.vue     # 秘密树洞
│       │   └── knowledge/
│       │       └── KnowledgeView.vue     # 心灵充电站
│       ├── components/                  # 可复用组件（待扩展）
│       ├── composables/                 # 组合式函数（待扩展）
│       ├── utils/                        # 工具函数（待扩展）
│       └── assets/                       # 静态资源（图片、样式等）
│
├── prd.md                              # 产品需求文档（PRD）
├── FULL_REQUIREMENTS.md                # 完整需求文档
├── PROJECT_OVERVIEW.md                 # 项目概览文档
├── README.md                           # 项目说明文档（本文件）
├── start.sh                            # 一键启动脚本
├── stop.sh                             # 停止服务脚本
├── start-backend.sh                    # 后端启动脚本
├── start-frontend.sh                   # 前端启动脚本
├── .gitignore                           # Git 忽略文件
└── .git/                               # Git 仓库
```

---

## 🚀 快速开始

### 前置要求

在开始之前，请确保你的系统已安装以下软件：

- **Python** 3.8 或更高版本
- **Node.js** 16.0 或更高版本
- **npm** 8.0 或更高版本
- **Git**（用于版本控制）

### 一键启动

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd xinqing_app_demo
   ```

2. **一键启动前后端**
   ```bash
   bash start.sh
   ```

3. **访问应用**
   - 前端地址：http://localhost:3000
   - 后端地址：http://localhost:8000
   - API 文档：http://localhost:8000/docs

### 单独启动

#### 启动后端

```bash
# 方式 1：使用启动脚本
bash start-backend.sh

# 方式 2：手动启动
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 main.py
```

#### 启动前端

```bash
# 方式 1：使用启动脚本
bash start-frontend.sh

# 方式 2：手动启动
cd frontend
npm install
npm run dev
```

### 停止服务

```bash
bash stop.sh
```

---

## ⚙️ 环境配置

### 后端环境变量

1. 复制环境变量示例文件：
   ```bash
   cp backend/.env.example backend/.env
   ```

2. 根据需要修改 `backend/.env` 文件：
   ```env
   # 应用配置
   APP_NAME=心情疗愈 App
   DEBUG=True
   HOST=0.0.0.0
   PORT=8000

   # 数据库配置
   DATABASE_URL=sqlite:///./xinqing.db

   # JWT 配置
   SECRET_KEY=your-secret-key-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=604800

   # 加密密钥
   ENCRYPTION_KEY=your-encryption-key-change-in-production
   ```

### 前端环境变量

1. 复制环境变量示例文件：
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. 根据需要修改 `frontend/.env` 文件：
   ```env
   # API 配置
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_TIMEOUT=10000

   # 应用配置
   VITE_APP_TITLE=心情疗愈
   VITE_APP_VERSION=1.0.0
   ```

---

## 📖 开发指南

### 代码规范

- **Python**：遵循 PEP 8 风格指南
- **JavaScript/Vue**：遵循 ESLint 规则
- **Git**：使用语义化提交信息（Conventional Commits）

### 分支策略

- `main`：主分支，稳定版本
- `develop`：开发分支
- `feature/*`：功能分支
- `bugfix/*`：Bug 修复分支

### 提交流程

1. 从 `develop` 分支创建新分支
2. 进行开发和测试
3. 提交代码并推送到远程仓库
4. 创建 Pull Request 到 `develop`
5. 代码审查通过后合并

### 添加新功能

1. 在 `frontend/src/views/` 下创建新视图组件
2. 在 `backend/app/api/v1/` 下添加新 API 端点
3. 在 `backend/app/models/` 下添加数据库模型
4. 在 `frontend/src/api/` 下封装 API 调用
5. 在 `frontend/src/stores/` 下添加状态管理
6. 更新路由配置

---

## 📚 API 文档

### Swagger UI

启动后端服务后，访问：
```
http://localhost:8000/docs
```

### ReDoc

启动后端服务后，访问：
```
http://localhost:8000/redoc
```

### API 端点

#### 情绪记录 API

- `POST /api/v1/emotion-records` - 创建情绪记录
- `GET /api/v1/emotion-records` - 获取情绪记录列表
- `GET /api/v1/emotion-records/weekly-report` - 获取周报统计

#### 正念练习 API

- `POST /api/v1/mindfulness-sessions` - 创建练习记录

#### 秘密树洞 API

- `POST /api/v1/treehole-entries` - 创建树洞条目
- `GET /api/v1/treehole-entries` - 获取已发布的条目

#### 知识库 API

- `GET /api/v1/knowledge-contents` - 获取知识库内容

更多 API 详情请参考 Swagger UI 文档。

---

## 🚢 部署

### 开发环境部署

详见 [快速开始](#快速开始) 部分。

### 生产环境部署（TODO）

- Docker 容器化部署
- 云服务器部署（阿里云、腾讯云等）
- CDN 加速
- 数据库备份
- 日志监控

---

## ❓ 常见问题

### 1. 后端启动失败

**问题**：启动后端时报错 `ModuleNotFoundError`

**解决方案**：
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 前端启动失败

**问题**：启动前端时报错 `Cannot find module`

**解决方案**：
```bash
cd frontend
npm install
```

### 3. 端口被占用

**问题**：启动时报错 `Address already in use`

**解决方案**：
- 修改 `backend/.env` 中的 `PORT` 配置
- 或修改 `frontend/vite.config.js` 中的 `server.port` 配置

### 4. CORS 错误

**问题**：前端访问后端 API 时报错 CORS 错误

**解决方案**：
- 确保后端正在运行
- 检查 `backend/main.py` 中的 CORS 配置
- 检查 `frontend/.env` 中的 `VITE_API_BASE_URL` 配置

### 5. 数据库错误

**问题**：启动时报错数据库相关错误

**解决方案**：
```bash
cd backend
rm xinqing.db  # 删除现有数据库
python3 main.py  # 重新启动，自动创建新数据库
```

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

### 贡献指南

- 遵循项目的代码规范
- 添加必要的测试
- 更新相关文档
- 编写清晰的提交信息

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/xinqing_app_demo/issues)
- 发送邮件至：your-email@example.com

---

## 🌟 项目状态

![项目进度](https://img.shields.io/badge/进度-85%25-yellow) ![状态-开发中-blue) ![版本-v1.0.0.0-brightgreen)

### 已完成功能

- ✅ 情绪气象站
- ✅ 正念实验室
- ✅ 秘密树洞（含 AI 风险检测）
- ✅ 心灵充电站

### 待完成功能

- ⏳ 用户认证系统
- ⏳ 文件上传功能
- ⏳ 媒体文件管理
- ⏳ 更多测试用例
- ⏳ Docker 配置

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star 支持一下！**

Made with 💝 by Claude Code

</div>
