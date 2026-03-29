# Emotion And Knowledge Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the emotion and knowledge pages so they feel more like a polished mobile app while preserving all existing content and behavior.

**Architecture:** Keep the current templates and data flow intact, then deepen the visual hierarchy through section wrappers, featured-card treatments, cleaner tabs, and more product-like list items. The changes stay inside the two page components and rely on the existing global token system.

**Tech Stack:** Vue 3, Element Plus, scoped CSS, global CSS variables

---

### Task 1: Refine the emotion page presentation

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`

**Step 1: Add stronger section hierarchy**

Promote the top card into a more app-like primary task surface and convert internal sections into cleaner, more deliberate content blocks.

**Step 2: Upgrade control presentation**

Make mood pills, sliders, sleep rating, and happy-moment input feel more premium through spacing, container styling, and summaries.

**Step 3: Elevate the weekly report**

Make the report feel like a compact analytics panel with clearer number emphasis and lighter metadata.

### Task 2: Refine the knowledge page presentation

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Upgrade the quote card**

Turn the daily quote into a stronger featured module with better spacing and metadata placement.

**Step 2: Polish tabs and lists**

Keep the same tabs and content types, but restyle the panes so video/test/article/topic items feel more like curated product cards.

**Step 3: Improve modal and quiz surfaces**

Keep existing dialog behavior while making category chips, questions, and result cards feel more coherent with the refined app style.

### Task 3: Verify the build

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully

**Step 2: Report warnings separately**

Call out any non-blocking bundle warnings after confirming the build passed.
