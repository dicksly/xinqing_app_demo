# Knowledge Test Featured Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the knowledge page's test tab into a featured app-style entry page with one primary recommended test and lighter secondary test rows.

**Architecture:** Keep the existing test data and dialog behavior, but split the visual presentation into a highlighted featured card plus a secondary list. The test dialog stays on the same code path and receives styling polish only.

**Tech Stack:** Vue 3, Element Plus, scoped CSS, global CSS variables

---

### Task 1: Restructure the test tab presentation

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Add featured test selection**

Use the existing computed `tests` list and present the first item as a highlighted hero card.

**Step 2: Render the remaining tests as secondary rows**

Keep click behavior unchanged while reducing visual weight for non-featured items.

### Task 2: Polish the dialog surfaces

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Improve test question card styling**

Make question blocks and result states feel more like a polished app feature surface.

**Step 2: Refine CTA hierarchy**

Clarify the primary action and supporting metadata styling.

### Task 3: Verify the build

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully
