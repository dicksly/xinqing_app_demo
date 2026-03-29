# Page Header Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify the top title areas of the five main user-facing pages into one coherent section-header system.

**Architecture:** Keep each page's content and behavior intact while normalizing the header markup and styles around a shared pattern: icon, title, subtitle, and a light status chip. Reuse the existing token system and avoid introducing a new component for this pass.

**Tech Stack:** Vue 3, scoped CSS, global CSS variables

---

### Task 1: Normalize header markup

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/views/profile/ProfileView.vue`

**Step 1: Add matching header-copy blocks**

Ensure each page uses a common header structure with title and subtitle.

**Step 2: Add matching light chips**

Use a small right-side chip on each top-level page header.

### Task 2: Normalize header styling

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/views/profile/ProfileView.vue`

**Step 1: Align spacing, icon position, and subtitle styling**

Make the headers feel like one product system.

**Step 2: Preserve page-specific tone**

Keep subtitle copy page-specific while maintaining one visual hierarchy.

### Task 3: Verify the build

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully
