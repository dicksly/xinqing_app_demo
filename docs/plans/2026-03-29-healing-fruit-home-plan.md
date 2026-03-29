# Healing Fruit Home Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated home tab and restyle the user-facing app into a unified healing-fruit visual system inspired by the provided references.

**Architecture:** Add a new home route and view, update app shell navigation to include the home tab, and refactor global tokens plus high-visibility pages to use one consistent soft fruit-themed UI system. Preserve business logic and existing module routing.

**Tech Stack:** Vue 3, Pinia, Vue Router, Element Plus, Vite, scoped CSS, global CSS variables

---

### Task 1: Document the new visual direction

**Files:**
- Create: `docs/plans/2026-03-29-healing-fruit-home-design.md`

**Step 1: Write the design document**

Capture the home information architecture, visual language, and page unification rules.

**Step 2: Verify the file exists**

Run: `test -f docs/plans/2026-03-29-healing-fruit-home-design.md`
Expected: command exits successfully

### Task 2: Add home route and localized labels

**Files:**
- Modify: `frontend/src/router/index.js`
- Modify: `frontend/src/locales/zh-CN.js`
- Modify: `frontend/src/locales/en-US.js`

**Step 1: Add `/home` route**

Create a new app entry route and redirect `/` to `/home`.

**Step 2: Add home navigation copy**

Add navigation and home page text in both locales.

### Task 3: Build the new home screen

**Files:**
- Create: `frontend/src/views/home/HomeView.vue`

**Step 1: Implement hero and card launcher layout**

Build the centered badge, title, tagline, and four large feature cards.

**Step 2: Wire launcher cards to routes**

Each primary card should route to its existing module page.

### Task 4: Update app shell and tab layout

**Files:**
- Modify: `frontend/src/App.vue`

**Step 1: Add home as first tab**

Update navigation order and active-tab logic.

**Step 2: Align shell styling with the new direction**

Simplify the shell to support the healing-fruit look across pages.

### Task 5: Replace multi-theme styling with one unified product theme

**Files:**
- Modify: `frontend/src/stores/theme.js`
- Modify: `frontend/src/styles/global.css`

**Step 1: Set one primary UI theme**

Remove visible multi-theme switching behavior from the shell and keep a single default theme system.

**Step 2: Refresh global tokens**

Define the new blush/ivory/green design system and shared control styling.

### Task 6: Restyle user-facing pages for consistency

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/views/profile/ProfileView.vue`

**Step 1: Keep existing content structure**

Do not rewrite core product behavior.

**Step 2: Update visual treatment**

Apply the new rounded cards, softer surfaces, and stronger hierarchy to each page.

### Task 7: Verify build integrity

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully

**Step 2: Report any warnings**

Call out non-blocking build warnings separately from failures.
