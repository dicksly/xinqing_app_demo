# Content Admin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a separate admin login and graphical content management backend for the Knowledge tab, starting with daily quotes, video/article content, and topics, then leaving test management as a follow-up phase.

**Architecture:** Reuse the existing frontend app for an `/admin` route namespace while introducing a separate admin authentication model and `/api/v1/admin/*` backend surface. Move Knowledge page content to database-backed public APIs so the user-facing page consumes published content only.

**Tech Stack:** Vue 3, Vue Router, Element Plus, FastAPI, SQLAlchemy, Pydantic, SQLite, Node test runner, Python unittest

---

### Task 1: Add admin data model and authentication basics

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/services/auth_service.py`
- Modify: `backend/app/api/v1/api.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_admin_auth.py`

**Step 1: Write the failing test**

Add tests for:
- successful admin login with valid username/password
- rejected login with invalid password
- protected admin endpoint denied without admin token

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_admin_auth`
Expected: FAIL because admin schema/table/routes do not exist

**Step 3: Write minimal implementation**

Implement:
- `AdminUser` model
- password hashing / verification reuse or minimal new helpers
- admin login schema and token response
- `/api/v1/admin/login`
- admin auth dependency for later routes

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_admin_auth`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models/models.py backend/app/schemas/schemas.py backend/app/services/auth_service.py backend/app/api/v1/api.py backend/main.py backend/tests/test_admin_auth.py
git commit -m "feat: add admin authentication"
```

### Task 2: Add daily quote persistence and public/admin APIs

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_daily_quotes_api.py`

**Step 1: Write the failing test**

Cover:
- admin can create/update/delete quote
- public quote endpoint returns only active/published quote

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_daily_quotes_api`
Expected: FAIL because quote model/routes do not exist

**Step 3: Write minimal implementation**

Implement:
- `DailyQuote` model
- admin CRUD endpoints
- `GET /api/v1/public/daily-quote`

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_daily_quotes_api`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models/models.py backend/app/schemas/schemas.py backend/app/api/v1/api.py backend/tests/test_daily_quotes_api.py
git commit -m "feat: add daily quote admin api"
```

### Task 3: Expand knowledge content model for admin management

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_knowledge_content_admin_api.py`

**Step 1: Write the failing test**

Cover:
- admin can create and update video/article content
- public content endpoint filters to published content
- filtering by `content_type` still works for frontend

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_knowledge_content_admin_api`
Expected: FAIL because fields/status/admin routes are missing

**Step 3: Write minimal implementation**

Add fields such as:
- `summary`
- `cover_url`
- `external_url`
- `status`
- `sort_order`
- `locale`
- `published_at`

Implement admin CRUD endpoints and adapt public list endpoint.

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_knowledge_content_admin_api`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models/models.py backend/app/schemas/schemas.py backend/app/api/v1/api.py backend/tests/test_knowledge_content_admin_api.py
git commit -m "feat: add admin knowledge content management"
```

### Task 4: Add topic model and public/admin APIs

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_knowledge_topics_api.py`

**Step 1: Write the failing test**

Cover:
- admin CRUD for topic
- public topics endpoint returns published/active ordered list

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_knowledge_topics_api`
Expected: FAIL because topic model/routes do not exist

**Step 3: Write minimal implementation**

Implement:
- `KnowledgeTopic` model
- admin CRUD routes
- `GET /api/v1/public/knowledge-topics`

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_knowledge_topics_api`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models/models.py backend/app/schemas/schemas.py backend/app/api/v1/api.py backend/tests/test_knowledge_topics_api.py
git commit -m "feat: add topic admin api"
```

### Task 5: Seed current hardcoded Knowledge data into backend

**Files:**
- Create: `backend/app/data/seed_knowledge_content.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_knowledge_seed.py`

**Step 1: Write the failing test**

Cover:
- seed inserts default quote/content/topic data when tables are empty
- seed does not duplicate rows on repeated runs

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_knowledge_seed`
Expected: FAIL because seeding logic does not exist

**Step 3: Write minimal implementation**

Move current hardcoded Knowledge content into a seed source and invoke it during startup or explicit initialization.

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_knowledge_seed`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/data/seed_knowledge_content.py backend/main.py backend/tests/test_knowledge_seed.py
git commit -m "feat: seed knowledge content data"
```

### Task 6: Add frontend admin auth shell and routing

**Files:**
- Modify: `frontend/src/router/index.js`
- Create: `frontend/src/views/admin/AdminLoginView.vue`
- Create: `frontend/src/views/admin/AdminContentView.vue`
- Create: `frontend/src/stores/admin.js`
- Modify: `frontend/src/api/index.js`
- Test: `frontend/tests/admin-auth.test.js`

**Step 1: Write the failing test**

Cover:
- admin route requires admin auth
- login success stores admin auth state

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/admin-auth.test.js`
Expected: FAIL because admin store/routes do not exist

**Step 3: Write minimal implementation**

Implement:
- admin login view
- admin auth store
- admin API client methods
- route guard for `/admin/content`

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/admin-auth.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/router/index.js frontend/src/views/admin/AdminLoginView.vue frontend/src/views/admin/AdminContentView.vue frontend/src/stores/admin.js frontend/src/api/index.js frontend/tests/admin-auth.test.js
git commit -m "feat: add admin frontend shell"
```

### Task 7: Build daily quote admin UI

**Files:**
- Modify: `frontend/src/views/admin/AdminContentView.vue`
- Create: `frontend/src/components/admin/DailyQuoteManager.vue`
- Test: `frontend/tests/admin-daily-quote.test.js`

**Step 1: Write the failing test**

Cover:
- quote list renders from API data
- create/edit modal submits expected payload

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/admin-daily-quote.test.js`
Expected: FAIL because manager UI does not exist

**Step 3: Write minimal implementation**

Implement list, create, edit, delete, publish toggle for quotes.

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/admin-daily-quote.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/admin/AdminContentView.vue frontend/src/components/admin/DailyQuoteManager.vue frontend/tests/admin-daily-quote.test.js
git commit -m "feat: add daily quote admin ui"
```

### Task 8: Build knowledge content admin UI

**Files:**
- Modify: `frontend/src/views/admin/AdminContentView.vue`
- Create: `frontend/src/components/admin/KnowledgeContentManager.vue`
- Test: `frontend/tests/admin-knowledge-content.test.js`

**Step 1: Write the failing test**

Cover:
- content list supports type filter
- content form submits video/article payload correctly

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/admin-knowledge-content.test.js`
Expected: FAIL because content manager UI does not exist

**Step 3: Write minimal implementation**

Implement admin list/form for video/article items with status and sort fields.

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/admin-knowledge-content.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/admin/AdminContentView.vue frontend/src/components/admin/KnowledgeContentManager.vue frontend/tests/admin-knowledge-content.test.js
git commit -m "feat: add knowledge content admin ui"
```

### Task 9: Build topic admin UI

**Files:**
- Modify: `frontend/src/views/admin/AdminContentView.vue`
- Create: `frontend/src/components/admin/KnowledgeTopicManager.vue`
- Test: `frontend/tests/admin-knowledge-topic.test.js`

**Step 1: Write the failing test**

Cover:
- topic list renders and saves status/sort changes

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/admin-knowledge-topic.test.js`
Expected: FAIL because topic manager UI does not exist

**Step 3: Write minimal implementation**

Implement list/form for topics.

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/admin-knowledge-topic.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/admin/AdminContentView.vue frontend/src/components/admin/KnowledgeTopicManager.vue frontend/tests/admin-knowledge-topic.test.js
git commit -m "feat: add topic admin ui"
```

### Task 10: Switch Knowledge page to public APIs only

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/api/index.js`
- Test: `frontend/tests/knowledge-view-data.test.js`

**Step 1: Write the failing test**

Cover:
- quote/content/topics come from API responses
- fallback hardcoded production content is removed

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/knowledge-view-data.test.js`
Expected: FAIL because view still uses hardcoded content

**Step 3: Write minimal implementation**

Replace local hardcoded data source with public API loading and empty-state handling.

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/knowledge-view-data.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/knowledge/KnowledgeView.vue frontend/src/api/index.js frontend/tests/knowledge-view-data.test.js
git commit -m "feat: load knowledge content from backend"
```

### Task 11: Add phase-two test management foundation

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_knowledge_tests_api.py`

**Step 1: Write the failing test**

Cover:
- admin can create test with nested questions/options
- public tests endpoint returns published tests

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_knowledge_tests_api`
Expected: FAIL because test tables/routes do not exist

**Step 3: Write minimal implementation**

Implement:
- `knowledge_tests`
- `knowledge_test_questions`
- `knowledge_test_options`
- admin CRUD with nested payload
- public read endpoints

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_knowledge_tests_api`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models/models.py backend/app/schemas/schemas.py backend/app/api/v1/api.py backend/tests/test_knowledge_tests_api.py
git commit -m "feat: add test content admin api"
```

### Task 12: Add phase-two test management UI

**Files:**
- Modify: `frontend/src/views/admin/AdminContentView.vue`
- Create: `frontend/src/components/admin/KnowledgeTestManager.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Test: `frontend/tests/admin-knowledge-tests.test.js`
- Test: `frontend/tests/knowledge-tests-public.test.js`

**Step 1: Write the failing test**

Cover:
- admin can edit nested questions/options
- public Knowledge test tab renders backend-managed tests

**Step 2: Run test to verify it fails**

Run: `node --test frontend/tests/admin-knowledge-tests.test.js frontend/tests/knowledge-tests-public.test.js`
Expected: FAIL because test manager and public loading are incomplete

**Step 3: Write minimal implementation**

Add test management UI and replace hardcoded test definitions in Knowledge view.

**Step 4: Run test to verify it passes**

Run: `node --test frontend/tests/admin-knowledge-tests.test.js frontend/tests/knowledge-tests-public.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/views/admin/AdminContentView.vue frontend/src/components/admin/KnowledgeTestManager.vue frontend/src/views/knowledge/KnowledgeView.vue frontend/tests/admin-knowledge-tests.test.js frontend/tests/knowledge-tests-public.test.js
git commit -m "feat: add admin test management ui"
```

### Task 13: Full verification

**Files:**
- Verify only

**Step 1: Run backend verification**

Run:
`./venv/bin/python -m unittest tests.test_admin_auth tests.test_daily_quotes_api tests.test_knowledge_content_admin_api tests.test_knowledge_topics_api tests.test_knowledge_seed tests.test_knowledge_tests_api`

Expected: PASS

**Step 2: Run frontend verification**

Run:
`node --test frontend/tests/theme-contrast.test.js frontend/tests/admin-auth.test.js frontend/tests/admin-daily-quote.test.js frontend/tests/admin-knowledge-content.test.js frontend/tests/admin-knowledge-topic.test.js frontend/tests/admin-knowledge-tests.test.js frontend/tests/knowledge-view-data.test.js frontend/tests/knowledge-tests-public.test.js`

Expected: PASS

**Step 3: Run production build**

Run:
`npm run build`

Expected: PASS with only known chunk-size warnings

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add content admin backend"
```
