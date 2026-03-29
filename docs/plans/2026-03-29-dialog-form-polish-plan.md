# Dialog And Form Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify dialogs and form controls across the app so they match the same polished product language as the page-level UI.

**Architecture:** Apply the refinement primarily in the global design system layer so existing page templates inherit the new finish automatically. Focus on dialog chrome, inputs, selects, textareas, tabs, radio groups, checkboxes, and related focus/active states without changing behavior.

**Tech Stack:** Vue 3, Element Plus, global CSS variables, scoped CSS compatibility

---

### Task 1: Refine dialog surfaces

**Files:**
- Modify: `frontend/src/styles/global.css`

**Step 1: Upgrade dialog shell**

Polish dialog header, body, footer, close button, separators, and empty states.

**Step 2: Normalize footer actions**

Make dialog CTA hierarchy clearer and more consistent.

### Task 2: Refine form controls

**Files:**
- Modify: `frontend/src/styles/global.css`

**Step 1: Inputs and selects**

Improve field shell, focus ring, placeholder tone, and hover/focus transitions.

**Step 2: Tabs, radio groups, and checkboxes**

Unify active, hover, and selected states with the same restrained interaction language.

### Task 3: Verify the build

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully
