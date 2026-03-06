# 心理健康与情绪疗愈 App - 项目概览

## 项目信息
- **项目名称**：心情疗愈 (Xinqing App)
- **版本**：v1.0.0 (MVP)
- **开发状态**：✅ 核心功能已完成
- **Git 提交**：2 commits, 26 files changed

---

## 技术栈

### 前端
- **框架**：Vue 3.4.0
- **构建工具**：Vite 5.0.0
- **状态管理**：Pinia 2.1.0
- **路由**：Vue Router 4.2.0
- **HTTP 客户端**：Axios 1.6.0
- **UI 组件库**：Element Plus 2.4.0
- **图标**：@element-plus/icons-vue 2.3.0

### 后端
- **框架**：FastAPI (Python 3.x)
- **数据库 ORM**：SQLAlchemy
- **数据验证**：Pydantic
- **数据库**：SQLite (本地存储)
- **加密**：python-cryptography

---

## 项目结构

```
xinqing_app_demo/
├── backend/                           # 后端服务
│   ├── main.py                        # FastAPI 主入口
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
├── frontend/                         # 前端应用
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js                   # 应用入口
│       ├── App.vue                   # 主组件
│       ├── api/
│       │   └── index.js                # API 服务封装
│       ├── router/
│       │   └── index.js                # 路由配置
│       ├── stores/
│       │   └── emotion.js              # 情绪状态管理
│       ├── views/
│       │   ├── emotion/
│       │   │   └── EmotionView.vue      # 情绪气象站
│       │   ├── mindfulness/
│       │   │   └── MindfulnessView.vue  # 正念实验室
│       │   ├── treehole/
│       │   │   └── TreeholeView.vue     # 秘密树洞
│       │   └── knowledge/
│           └── KnowledgeView.vue     # 心灵充电站
│       ├── components/                # 组件（待扩展）
│       ├── composables/               # 组合式函数（待扩展）
│       ├── utils/                     # 工具函数（待扩展）
│       └── assets/                    # 静态资源（待扩展）
│
├── prd.md                            # 产品需求文档
├── FULL_REQUIREMENTS.md            # 完整需求文档
└── .git/                             # Git 仓库
```

---

## 已实现功能

### 后端 API

#### 1. 情绪记录 API
- `POST /api/v1/emotion-records` - 创建情绪记录
- `GET /api/v1/emotion-records` - 获取情绪记录列表
- `GET /api/v1/emotion-records/weekly-report` - 获取周报统计

#### 2. 正念练习 API
- `POST /api/v1/mindfulness-sessions` - 创建练习记录

#### 3. 秘密树洞 API
- `POST /api/v1/treehole-entries` - 创建树洞条目
  - 自动风险检测
  - AI 情感响应生成
- `GET /api/v1/treehole-entries` - 获取已发布的条目

#### 4. 知识库 API
- `GET /api/v1/knowledge-contents` - 获取知识库内容

### 前端界面

#### 1. 情绪气象站
- ✅ 心情选择器（5种心情：焦虑、丧、平静、开心、元气）
- ✅ 能量滑块（0-100%）
- ✅ 睡眠质量评分（1-5星）
- ✅ 压力源标签（多选）
- ✅ 社交意愿选择（独处/社交）
- ✅ 微光时刻输入（文字、灵感提示）
- ✅ 周报展示（统计数据、压力源分析）

#### 2. 正念实验室
- ✅ 场景化冥想
  - 睡眠助眠、晨间唤醒、考前/面试前抗压、情绪急救
  - 时长选择（3分钟/10分钟/20分钟）
  - 音量控制（人声/背景音）
  - 背景音类型选择（白噪音、自然声、阿尔法波音乐）
- ✅ 4-7-8 呼吸训练
  - 动画呼吸圆圈（吸气放大、呼气缩小）
  - 震动提示（支持移动端）
  - 步骤说明
- ✅ 解压小游戏
  - 捏泡泡纸、切肥皂、整理收纳、曼陀罗涂色

#### 3. 秘密树洞
- ✅ 内容类型选择（文字/语音/图片）
- ✅ 文字输入（最多1000字）
- ✅ 语音输入（模拟录音界面、时长显示）
- ✅ 变声处理选项
- ✅ 发布选项（匿名、发布到广场）
- ✅ AI 倾听回应
  - 自动风险检测（严重/中等/安全）
  - 分级干预措施
  - 共情型情感回应
- ✅ 公开树洞广场
  - 最新/我的标签切换
  - 匿名条目展示

#### 4. 心灵充电站
- ✅ 每日金句（带日期）
- ✅ 短视频/条漫
  - 心理测试（MBTI、压力自测、依恋类型）
  - 测试问卷界面
  - 测试结果展示
  - 建议说明
- ✅ 知识文章
  - 专题策划（考试季、毕业季、求职季）

### UI/UX 设计
- ✅ 莫兰迪色系主题（低饱和度治愈风）
- ✅ 顶部导航栏（图标+文字）
- ✅ 卡片式布局
- ✅ 响应式设计
- ✅ 平滑动画过渡
- ✅ 表情符号和图标

### 数据模型

#### EmotionRecord（情绪记录表）
- id, mood, energy_level, sleep_quality
- stress_sources, social_preference
- happy_moment, happy_moment_type, happy_moment_media_path
- created_at, updated_at

#### MindfulnessSession（正念练习记录表）
- id, session_type, duration_minutes
- completed, created_at

#### TreeholeEntry（秘密树洞条目表）
- id, content_type, content, media_path
- is_anonymous, is_published, has_voice_change
- risk_level, ai_response
- created_at

#### KnowledgeContent（知识库内容表）
- id, title, content_type, content
- category, tags, view_count
- created_at

---

## P0 级关键功能（已完成）

### AI 风险检测与干预
- ✅ 敏感词识别（自杀、自残等高危关键词）
- ✅ 分级干预（严重/中等/安全）
- ✅ 危机预警
  - 心理援助热线展示（400-161-9995, 021-62798990）
  - 本地危机干预中心联系方式
  - 温和专业引导语
- ✅ 中等风险提示
  - 呼吸训练建议
  - 正念练习引导
  - 寻求专业帮助建议

---

## 待完成功能

### 必需完成
1. ⏳ 后端依赖文件（requirements.txt）
2. ⏳ 前端依赖安装和构建
3. ⏳ 开发环境启动脚本

### 可选功能
1. ⏳ 用户认证系统（JWT）
2. ⏳ 文件上传功能（语音、图片）
3. ⏳ 媒体文件管理
4. ⏳ 更详细的 API 文档（Swagger/OpenAPI）
5. ⏳ 单元测试和集成测试
6. ⏳ Docker 配置
7. ⏳ 生产环境部署配置

---

## 快速开始

### 后端启动
```bash
cd backend
pip install -r requirements.txt  # (需要先创建)
python main.py
```
后端将在 `http://localhost:8000` 启动

### 前端启动
```bash
cd frontend
npm install
npm run dev
```
前端将在 `http://localhost:3000` 启动

---

## API 文档
启动后端后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 数据库
- **数据库文件**：`backend/xinqing.db` (SQLite)
- **自动创建**：应用启动时自动创建所有表
- **加密存储**：敏感数据使用 python-cryptography 加密

---

## 安全与隐私
- ✅ 端到端加密存储敏感数据
- ✅ 匿名发布选项
- ✅ 变声处理功能
- ✅ 脱敏处理（树洞广场）
- ✅ 敏感词识别和风险预警

---

## 浏览器支持
- Chrome (推荐)
- Firefox
- Safari
- Edge

---

## 贡献者
- 开发团队：Claude Code

---

## 许可证
待添加

---

## 更新日志

### v1.0.0 (2024-03-06)
- ✅ 初始版本发布
- ✅ 实现四大核心模块
- ✅ AI 风险检测和干预功能
- ✅ 莫兰迪色系治愈风 UI
- ✅ 响应式设计
