# 解压小游戏设计方案

## 项目概述

为心情疗愈 App 实现 4 个沉浸式解压小游戏，包含完整的用户认证系统和游戏进度存储。

## 需求总结

| 维度 | 选择 |
|------|------|
| 交互复杂度 | 核心玩法（基础动画，可后续迭代） |
| 成就系统 | 轻松收集型（皮肤/主题解锁） |
| 音效反馈 | 程序生成（Web Audio API） |
| 数据存储 | 游客优先（localStorage + 登录同步） |
| 用户认证 | 账号密码（需同时开发） |

## P0 实现决策（2026-03-08 更新）

经过 brainstorming 确定的 P0 实现方案：

1. **游客优先模式**
   - 默认使用 localStorage 存储游戏数据
   - 用户登录后自动同步到后端

2. **核心玩法**
   - 基础点击爆破 + 简单动画
   - 皮肤系统简化（保留解锁逻辑，视觉效果简化）

3. **程序生成音效**
   - 使用 Web Audio API 生成简单音效
   - 无需额外音频文件

## 模块1：用户认证系统

### 后端设计

**新增数据库表：**
```sql
-- 用户表
users (
  id, username, email, password_hash,
  created_at, last_login
)
```

**新增 API 端点：**
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录（返回 JWT token）
- `POST /api/v1/auth/logout` - 登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 前端设计

**Pinia Store：** `stores/auth.js`
- 状态：`user`, `token`, `isAuthenticated`
- 方法：`login()`, `register()`, `logout()`, `checkAuth()`

**UI 组件：**
- 登录/注册弹窗（复用 Element Plus 的 Dialog + Form）
- 顶部导航栏显示用户状态
- 路由守卫：需要认证的操作自动弹出登录框

## 模块2：游戏数据存储

### 后端设计

**新增数据库表：**
```sql
-- 游戏进度表
game_progress (
  id, user_id, game_type,
  total_play_count, total_play_time,
  unlocked_skins,  -- JSON 格式存储已解锁皮肤列表
  current_skin,    -- 当前使用的皮肤
  stats,           -- JSON 格式存储游戏特定统计数据
  updated_at
)

-- game_type 枚举: 'bubble', 'soap', 'organize', 'mandala'
```

**新增 API 端点：**
- `GET /api/v1/games/progress` - 获取所有游戏进度
- `GET /api/v1/games/progress/:game_type` - 获取单个游戏进度
- `POST /api/v1/games/progress/:game_type` - 更新游戏进度（解锁皮肤、保存数据）
- `POST /api/v1/games/sync` - 批量同步本地数据（登录时调用）

### 前端设计

**Pinia Store：** `stores/games.js`
- 状态：`progressMap`（各游戏进度）、`currentGame`、`isGuest`
- 方法：`fetchProgress()`, `updateProgress()`, `syncLocalToServer()`, `recordPop()`

**本地缓存策略：**
- 游客模式：数据存 localStorage
- 登录后：自动同步本地数据到服务器，然后清空本地缓存

## 模块3：四个解压小游戏详细设计

### 3.1 捏泡泡纸 🫧（P0 实现）

**玩法：**
- 网格布局的泡泡（6x8 = 48个），点击按压爆破
- 支持长按"缓慢挤压"或快速点击
- 爆破时有视觉特效（简化版碎片飞散）+ 音效 + 震动
- 泡泡可以"重置"全部重新充气

**解锁系统（简化版）：**
| 解锁条件 | 皮肤名称 | 效果 |
|---------|---------|------|
| 初始 | 默认 | 经典透明泡泡 |
| 累计捏 50 个 | 彩虹泡泡 | 7色渐变泡泡 |
| 累计捏 200 个 | 星空泡泡 | 深蓝背景+星星点缀 |

**统计：** 总爆破数、单次最高连击、总游戏时长

### 3.2 切肥皂 🧼（P1）

**玩法：**
- 一块 3D 造型肥皂在中央，可拖拽旋转
- 滑动切割，肥皂沿切线分成两块
- 切开后有泡沫粒子飞溅 + 咔嚓音效
- 切到一定数量后肥皂"用完"，自动换新肥皂

**解锁系统：**
| 解锁条件 | 皮肤名称 | 效果 |
|---------|---------|------|
| 累计切 20 块 | 薰衣草皂 | 淡紫色+花朵纹理 |
| 累计切 80 块 | 海洋皂 | 蓝绿渐变+贝壳装饰 |
| 累计切 200 块 | 金砖皂 | 金色闪亮+奢华粒子 |

**统计：** 总切割数、切割总块数、总游戏时长

### 3.3 整理收纳 📦（P1）

**玩法：**
- 散落的物品（书本、杯子、衣物等）在画面中
- 拖拽物品放入对应的位置（书架、柜子、盒子）
- 放置正确时有"咔哒"吸附动画 + 满足感音效
- 全部整理完成后显示"完美收纳"动画

**解锁系统：**
| 解锁条件 | 皮肤名称 | 效果 |
|---------|---------|------|
| 完成 10 次收纳 | 北欧风 | 浅木色家具+绿植 |
| 完成 30 次收纳 | 日式风 | 榻榻米+纸门元素 |
| 完成 60 次收纳 | 赛博风 | 霓虹灯+深色背景 |

**统计：** 完成次数、平均用时、总游戏时长

### 3.4 曼陀罗涂色 🎨（P1）

**玩法：**
- 提供多个曼陀罗线稿模板
- 点击区域填充颜色，支持颜色选择器
- 有"推荐配色"和"自由创作"模式
- 完成后可保存/分享作品

**解锁系统：**
| 解锁条件 | 皮肤名称 | 效果 |
|---------|---------|------|
| 完成 5 幅作品 | 春日调色板 | 粉绿黄柔和配色 |
| 完成 15 幅作品 | 梵高调色板 | 浓郁黄蓝色调 |
| 完成 30 幅作品 | 极光调色板 | 北极光渐变配色 |

**统计：** 完成作品数、使用颜色数、总游戏时长

## 模块4：音效与感官反馈系统

### 程序生成音效（Web Audio API）- P0 采用

```javascript
// 简单的反馈音效，无需加载文件
class SoundGenerator {
  playPop()       // 泡泡破裂声
  playReset()     // 重置充气声
  playClick()     // 短促的"滴"声
  playSuccess()   // 上升音调的成功提示
  playUnlock()    // 解锁时的悦耳音效
}
```

### 震动反馈

```javascript
// 使用浏览器 Vibration API
navigator.vibrate(50)           // 短震动（点击）
navigator.vibrate([50, 30, 50]) // 双震动（完成）
```

### 音量控制

- 全局音量设置存储在 localStorage
- 游戏内提供音效/震动开关

## 模块5：整体架构与文件结构

### 前端新增文件结构

```
frontend/src/
├── stores/
│   ├── auth.js              # 用户认证状态
│   └── games.js             # 游戏数据状态
├── views/
│   └── mindfulness/
│       ├── MindfulnessView.vue        # 主页（修改：添加游戏入口）
│       └── games/
│           ├── GameModal.vue          # 游戏弹窗容器
│           ├── BubbleGame.vue         # 捏泡泡纸
│           ├── SoapGame.vue           # 切肥皂
│           ├── OrganizeGame.vue       # 整理收纳
│           └── MandalaGame.vue        # 曼陀罗涂色
├── components/
│   ├── auth/
│   │   ├── LoginDialog.vue            # 登录弹窗
│   │   └── RegisterDialog.vue         # 注册弹窗
│   └── game/
│       ├── SkinSelector.vue           # 皮肤选择器
│       ├── GameStats.vue              # 游戏统计面板
│       └── UnlockToast.vue            # 解锁提示组件
├── utils/
│   ├── sound.js                       # 音效管理器
│   └── vibration.js                   # 震动工具
└── assets/
    └── mandala-templates/             # 曼陀罗线稿 SVG
```

### 后端新增文件结构

```
backend/app/
├── models/
│   └── models.py            # 新增 User, GameProgress 模型
├── api/v1/
│   └── api.py               # 新增认证和游戏相关路由
├── schemas/
│   └── schemas.py           # 新增 User, GameProgress schemas
└── services/
    ├── auth_service.py      # 认证服务（JWT生成、密码加密）
    └── game_service.py      # 游戏数据服务
```

## P0 实现任务清单

按顺序实现：

| # | 任务 | 文件 |
|---|------|------|
| **后端** | | |
| 1 | 添加 User 和 GameProgress 模型 | `models/models.py` |
| 2 | 添加认证和游戏相关的 Schema | `schemas/schemas.py` |
| 3 | 实现 JWT 认证服务 | `services/auth_service.py` (新建) |
| 4 | 添加认证 API 路由 | `api/v1/api.py` |
| 5 | 添加游戏进度 API 路由 | `api/v1/api.py` |
| **前端** | | |
| 6 | 实现音效工具 | `utils/sound.js` (新建) |
| 7 | 实现震动工具 | `utils/vibration.js` (新建) |
| 8 | 实现 auth store | `stores/auth.js` (新建) |
| 9 | 实现 games store | `stores/games.js` (新建) |
| 10 | 实现登录/注册弹窗 | `components/auth/` (新建) |
| 11 | 实现泡泡游戏组件 | `views/mindfulness/games/BubbleGame.vue` (新建) |
| 12 | 修改正念页面添加游戏入口 | `views/mindfulness/MindfulnessView.vue` |
| 13 | 添加游戏相关 API 调用 | `api/index.js` |

### 实现优先级

1. **P0 - 核心功能**
   - 用户认证系统（注册/登录/JWT）
   - 游戏数据 API（进度存储/皮肤解锁）
   - 捏泡泡纸游戏（作为模板验证架构）

2. **P1 - 其他游戏**
   - 切肥皂游戏
   - 整理收纳游戏
   - 曼陀罗涂色游戏

3. **P2 - 增强体验**
   - 更丰富的视觉效果
   - 皮肤选择器 UI 完善
   - 游戏统计面板

## 技术栈

- 前端：Vue 3 + Pinia + Element Plus + Web Audio API
- 后端：FastAPI + SQLAlchemy + JWT + SQLite

## 预估新增文件

- 前端：约 10 个新文件（P0）
- 后端：约 2 个新文件 + 2 个修改（P0）
