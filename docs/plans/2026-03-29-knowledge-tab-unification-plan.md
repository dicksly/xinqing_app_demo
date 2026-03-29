# Knowledge Tab Unification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify the visual hierarchy of the knowledge page's video, test, article, and topic tabs so they feel like one coherent content product.

**Architecture:** Keep each tab's existing structure and interactions, but align all tab surfaces to the same content-card system. The implementation stays inside `KnowledgeView.vue` and focuses on card rhythm, metadata treatment, and visual hierarchy.

**Tech Stack:** Vue 3, Element Plus, scoped CSS, global CSS variables

---

### Task 1: Normalize tab-level editorial framing

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Add matching supporting copy where needed**

Ensure video and topic areas have the same editorial framing level as test and article.

**Step 2: Keep category-specific layouts**

Do not change the tab structures themselves.

### Task 2: Upgrade video and topic card treatment

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Refine video cards**

Make video cards feel like curated content cards instead of simple thumbnails.

**Step 2: Refine topic cards**

Make topic items feel like editorial planning cards with stronger hierarchy and metadata rhythm.

### Task 3: Verify the build

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully
