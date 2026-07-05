# Local Knowledge Articles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace seven iframe-blocked knowledge article links with app-native structured Chinese detail pages while preserving original source links.

**Architecture:** Add a small local article data module keyed by original `source_url`. The knowledge list routes matching articles to a new local detail route; non-local articles, videos, and tests keep their current behavior.

**Tech Stack:** Vue 3, Vue Router, Vite, plain ESM tests with Node `assert`.

---

### Task 1: Local Article Data Contract

**Files:**
- Create: `frontend/src/views/knowledge/knowledge-local-content.test.js`
- Create: `frontend/src/views/knowledge/knowledge-local-content.js`

**Steps:**
1. Write a failing Node test that asserts seven blocked source URLs resolve to local article records.
2. Run `node frontend/src/views/knowledge/knowledge-local-content.test.js` and confirm it fails because the module is missing.
3. Implement `LOCAL_KNOWLEDGE_ARTICLES`, `getLocalKnowledgeArticleById`, and `getLocalKnowledgeArticleBySourceUrl`.
4. Re-run the test and confirm it passes.

### Task 2: Local Detail Route

**Files:**
- Modify: `frontend/src/router/index.js`
- Create: `frontend/src/views/knowledge/KnowledgeLocalView.vue`

**Steps:**
1. Add a route named `KnowledgeLocal` at `/knowledge/local/:id`.
2. Build a mobile-first article detail view rendering summary, sections, practice steps, reflection prompts, and original source link.
3. Show a friendly empty state if the local article id is unknown.

### Task 3: Knowledge Page Routing

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Steps:**
1. Import `getLocalKnowledgeArticleBySourceUrl`.
2. In `viewArticle`, route local article matches to `KnowledgeLocal`.
3. Keep the existing dialog and external iframe behavior for all other content.

### Task 4: Verification

**Commands:**
- `node frontend/src/views/knowledge/knowledge-local-content.test.js`
- `npm --prefix frontend run build`

**Browser checks:**
- Open `/knowledge`.
- Click each of the seven formerly blocked articles.
- Confirm each opens `/knowledge/local/<id>` and shows native content plus an original source button.
