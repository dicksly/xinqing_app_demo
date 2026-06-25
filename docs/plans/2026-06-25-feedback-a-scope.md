# Feedback A-Scope Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the confirmed A-scope feedback iteration for the H5 app.

**Architecture:** Keep implementation local-first and data-driven. Product copy moves into locale dictionaries, home companion upgrades reuse `sprout-care`, assessment questions and external game links become config modules, and mindfulness audio gets a source fallback instead of silent failure.

**Tech Stack:** Vue 3, Vue Router, Vue I18n, Element Plus, Vite, Node test runner.

---

### Task 1: Add Regression Tests

**Files:**
- Modify: `frontend/tests/h5-redesign-ui.test.js`
- Modify: `frontend/tests/iteration-engagement.test.js`
- Modify: `frontend/tests/knowledge-view-data.test.js`

**Steps:**
1. Add tests for home task ordering, quest progress, memory wall aggregation, and full knowledge material sections.
2. Add tests for assessment question config and game-link config.
3. Add tests for mindfulness source fallback and app-shell English labels.
4. Run focused Node tests and verify the new tests fail for missing behavior.

### Task 2: Implement Config And Utility Changes

**Files:**
- Create: `frontend/src/utils/assessment-questions.js`
- Create: `frontend/src/utils/external-games.js`
- Modify: `frontend/src/utils/sprout-care.js`
- Modify: `frontend/src/utils/meditation-themes.js`

**Steps:**
1. Create data-driven assessment questions using the existing backend-compatible keys.
2. Create configurable external game entries with placeholder URLs.
3. Add quest progress and memory-wall helpers to `sprout-care`.
4. Add embeddable YouTube URLs and source-fallback metadata to meditation themes.
5. Run focused utility tests until green.

### Task 3: Implement Page Updates

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/locales/zh-CN.js`
- Modify: `frontend/src/locales/en-US.js`
- Modify: `frontend/src/views/home/HomeView.vue`
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/styles/global.css`

**Steps:**
1. Replace remaining major hardcoded app-shell/page copy with locale entries.
2. Move the home task under the hero and add the quest/energy UI.
3. Replace memory wall single diary display with derived memory cards.
4. Use assessment question config in the emotion questionnaire.
5. Show mindfulness source fallback when local audio fails and external game cards below internal games.
6. Add full material sections in knowledge.
7. Polish the bottom emotion icon treatment.

### Task 4: Verify

**Commands:**
- `node --test frontend/tests/iteration-engagement.test.js frontend/tests/h5-redesign-ui.test.js frontend/tests/knowledge-view-data.test.js frontend/tests/mindfulness-games.test.js`
- `node --test frontend/tests/*.test.js`
- `npm run build` from `frontend`

**Browser Checks:**
- `/home`
- `/emotion`
- `/mindfulness`
- `/treehole`
- `/knowledge`

**Expected:** Tests and build pass. Browser screenshots show no obvious overlap or broken main flows.
