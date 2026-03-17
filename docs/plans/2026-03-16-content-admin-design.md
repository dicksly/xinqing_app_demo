# 充电站内容后台设计

## 目标

为“充电站”建立一套可运营的后台配置方案，使每日金句、视频/文章、专题、心理测试题不再依赖前端硬编码，而是由独立后台登录的管理员通过图形化页面维护。

## 范围

本设计只覆盖“内容资源”的后台配置，不包含树洞运营资源、正念音频资源或用户端账号系统重构。

## 现状

当前项目中的充电站内容来源分散：

- 每日金句在 `frontend/src/views/knowledge/KnowledgeView.vue` 中硬编码。
- 心理测试题在同一文件中以计算属性直接定义。
- 专题数据在同一文件中以计算属性直接定义。
- 视频和文章部分已有后端 `knowledge_contents` 表与 `/knowledge-contents` 接口，但前端仍保留本地兜底内容。

这会带来三个直接问题：

- 内容更新必须改代码并重新部署。
- 运营人员无法独立维护内容。
- 测试题、专题、金句与文章/视频的内容形态不统一，缺少单一真源。

## 方案选择

### 方案 A：独立后台登录 + 图形化管理页 + 数据库存储

在现有应用内增加独立后台路由与后台登录体系，内容全部存数据库，管理员在图形化页面中增删改查。

优点：

- 最符合“后台人工配置”的长期目标。
- 内容维护和前台消费有清晰边界。
- 后续容易扩展审核、草稿、定时发布、多语言等能力。

缺点：

- 实现量最大，尤其是测试题管理。

### 方案 B：图形化后台页管理 JSON 配置

后台页面本质上编辑几份 JSON，保存到服务器文件或单表字段中，前台统一通过接口读取。

优点：

- 上线快。
- 不需要复杂表结构。

缺点：

- 测试题等嵌套内容校验较弱。
- 后续扩展性差，最终仍可能迁移到数据库模型。

### 方案 C：只做表和接口，人工直接改库

优点：

- 开发最少。

缺点：

- 不是真正可用的后台。
- 维护门槛高，风险大。

## 结论

采用方案 A，并按两阶段推进：

1. 第一阶段先落地每日金句、视频/文章、专题。
2. 第二阶段补充测试题管理。

这样能先把绝大多数内容管理能力上线，同时避免测试题嵌套编辑拖慢整体交付。

## 架构

### 后台入口

在现有前端中增加独立后台路由：

- `/admin/login`
- `/admin/content`

后台与用户端共用同一套前端工程和构建流程，但使用独立布局和独立认证状态，不复用用户端导航与账号逻辑。

### 后台登录体系

新增独立管理员账号体系，不与当前普通用户账号共用：

- 后端新增 `admin_users` 表。
- 后台登录接口单独签发 admin token。
- 所有后台管理接口统一挂载在 `/api/v1/admin/*`。
- 现有用户 token 不可访问后台接口。

这样可以确保运营账号与普通用户完全隔离，避免权限边界模糊。

### 数据模型

#### 1. 每日金句

新增 `daily_quotes` 表，建议字段：

- `id`
- `text`
- `author`
- `locale`
- `status`
- `sort_order`
- `effective_date`
- `created_at`
- `updated_at`

用于支持“当前启用”或按日期生效的金句配置。

#### 2. 内容主表

沿用并扩展 `knowledge_contents` 表，建议至少支持：

- `id`
- `title`
- `summary`
- `content`
- `content_type`，如 `video`、`article`
- `category`
- `cover_url`
- `external_url`
- `view_count`
- `locale`
- `status`
- `sort_order`
- `published_at`
- `created_at`
- `updated_at`

说明：

- 视频内容可用 `cover_url + external_url + summary`。
- 文章内容可用 `title + content + category`。
- `status` 支持草稿/发布。

#### 3. 专题

新增 `knowledge_topics` 表，建议字段：

- `id`
- `title`
- `description`
- `status`
- `content_count`
- `locale`
- `sort_order`
- `created_at`
- `updated_at`

#### 4. 测试题

新增三张表：

- `knowledge_tests`
- `knowledge_test_questions`
- `knowledge_test_options`

这样测试题可在后台页面中图形化编辑，而不是把完整结构塞进单个 JSON 字段。

`knowledge_tests` 建议字段：

- `id`
- `title`
- `description`
- `duration_label`
- `locale`
- `status`
- `sort_order`
- `result_rules` 或 `result_schema`
- `created_at`
- `updated_at`

`knowledge_test_questions` 建议字段：

- `id`
- `test_id`
- `question_text`
- `sort_order`

`knowledge_test_options` 建议字段：

- `id`
- `question_id`
- `option_text`
- `option_value`
- `sort_order`

## 接口设计

### 公共前台接口

前台充电站只读公共接口：

- `GET /api/v1/public/daily-quote`
- `GET /api/v1/public/knowledge-contents`
- `GET /api/v1/public/knowledge-topics`
- `GET /api/v1/public/knowledge-tests`
- `GET /api/v1/public/knowledge-tests/{id}`

公共接口只返回已发布内容。

### 后台管理接口

后台使用独立接口：

- `POST /api/v1/admin/login`
- `POST /api/v1/admin/logout`
- `GET /api/v1/admin/me`
- `GET/POST/PUT/DELETE /api/v1/admin/daily-quotes`
- `GET/POST/PUT/DELETE /api/v1/admin/knowledge-contents`
- `GET/POST/PUT/DELETE /api/v1/admin/knowledge-topics`
- `GET/POST/PUT/DELETE /api/v1/admin/knowledge-tests`

测试题详情接口需支持同时返回题目和选项的嵌套结构，方便后台编辑。

## 后台页面设计

### 登录页

后台登录页只保留最小表单：

- 用户名
- 密码
- 登录按钮

登录成功后跳转 `/admin/content`。

### 内容管理页

`/admin/content` 采用四个 tab：

- 每日金句
- 内容管理
- 专题管理
- 测试题

每个 tab 都至少支持：

- 列表展示
- 搜索/筛选
- 新建
- 编辑
- 删除
- 发布状态切换

#### 第一阶段页面

先实现：

- 每日金句
- 内容管理
- 专题

#### 第二阶段页面

补充：

- 测试题列表
- 测试题编辑弹窗
- 题目与选项的嵌套编辑

## 前台改造策略

充电站页面改为完全依赖后端公共接口：

- 每日金句来自 `daily_quotes`
- 视频/文章来自 `knowledge_contents`
- 专题来自 `knowledge_topics`
- 测试题来自 `knowledge_tests`

前端本地硬编码数据不再作为主数据源，最多只保留空态兜底提示，不保留正式内容。

## 迁移与初始化

需要把当前前端硬编码内容导入数据库作为初始种子：

- 每日金句
- 视频兜底内容
- 专题列表
- 测试题及题目选项

这样切换到后台管理后不会出现“页面空白”的上线风险。

## 风险

### 测试题编辑复杂度

测试题是嵌套数据结构，是本次实现量最大的部分。

缓解方式：

- 第一阶段先不阻塞其余内容管理上线。
- 第二阶段单独做测试题编辑器。

### 后台与前台混用同一前端工程

复用同一工程可以减少成本，但要防止用户端状态污染后台。

缓解方式：

- 后台用单独路由前缀。
- 后台用单独 token 存储 key。
- 后台布局不复用用户端底部导航。

## 验证

后端验证：

- 管理员登录成功/失败
- 非管理员访问后台接口被拒绝
- 各内容资源 CRUD
- 公共接口只返回发布内容

前端验证：

- 后台登录流程
- 四个后台 tab 的列表与编辑
- 充电站页面改为消费接口后正确展示

## 最终建议

先执行第一阶段：

- 独立后台登录
- 每日金句管理
- 视频/文章管理
- 专题管理
- 充电站前台切换到数据库接口

待第一阶段稳定后，再做第二阶段测试题后台管理。
