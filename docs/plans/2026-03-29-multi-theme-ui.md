# Multi-Theme UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three switchable frontend UI themes and apply them to the app shell plus the main user-facing pages without changing product behavior.

**Architecture:** Extend the existing theme store to manage both luminance and theme identity, then drive a semantic CSS token layer from `html` classes/data attributes. Update the shell and high-traffic views to consume the new tokens so each theme looks intentionally different while preserving the same routes and features.

**Tech Stack:** Vue 3, Pinia, Vue Router, Element Plus, Vite, scoped CSS plus global CSS variables

---

### Task 1: Document the theme model

**Files:**
- Create: `docs/plans/2026-03-29-ui-theme-design.md`

**Step 1: Write the design document**

Describe the three themes, scope, token strategy, shell changes, and validation criteria.

**Step 2: Verify the file exists**

Run: `test -f docs/plans/2026-03-29-ui-theme-design.md`
Expected: command exits successfully

### Task 2: Extend theme state and persistence

**Files:**
- Modify: `frontend/src/stores/theme.js`

**Step 1: Add theme identity support**

Implement a `uiTheme` state value with three allowed options: `soft-air`, `glow-night`, and `playful-bloom`.

**Step 2: Keep dark-mode compatibility**

Preserve `isDark` and make `applyTheme()` set both the `.dark` class and `data-ui-theme` attribute on `document.documentElement`.

**Step 3: Add switching helpers**

Add `setUiTheme(theme)` and `cycleUiTheme()` methods plus localStorage persistence.

### Task 3: Build global semantic theme tokens

**Files:**
- Modify: `frontend/src/styles/global.css`

**Step 1: Refactor root tokens**

Keep existing base utility classes, but convert hard-coded visual values to semantic variables for shell background, surface, border, accent, navigation, and text.

**Step 2: Add per-theme token blocks**

Create selectors for:
- `:root[data-ui-theme="soft-air"]`
- `:root[data-ui-theme="glow-night"]`
- `:root[data-ui-theme="playful-bloom"]`

**Step 3: Add shared overrides**

Add reusable theme-aware styling for cards, buttons, pills, and core Element Plus controls used on the main pages.

### Task 4: Upgrade the app shell

**Files:**
- Modify: `frontend/src/App.vue`

**Step 1: Add a theme switcher control**

Expose the current theme label and cycle through themes with one tap.

**Step 2: Improve shell composition**

Add a small hero/brand area and theme-aware wrappers so the app immediately feels different across themes.

**Step 3: Restyle top controls and bottom nav**

Convert them to token-driven floating surfaces with a stronger active state.

### Task 5: Apply the theme system to high-visibility pages

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/profile/ProfileView.vue`

**Step 1: Emotion page**

Improve hierarchy for mood selection, sliders, and weekly report surfaces.

**Step 2: Knowledge page**

Strengthen the quote block, content tabs, and item cards.

**Step 3: Treehole page**

Improve the composer, AI response card, and list cards with more intentional spacing and depth.

**Step 4: Profile page**

Improve identity card, metrics, and menu item styling.

### Task 6: Verify build integrity

**Files:**
- Modify: none expected

**Step 1: Run production build**

Run: `cd frontend && npm run build`
Expected: build completes successfully

**Step 2: Review for regressions**

Check for compile-time errors, missing imports, or broken scoped CSS assumptions.

### Task 7: Summarize implementation

**Files:**
- Modify: none expected

**Step 1: Report theme names and affected files**

Summarize what changed, which screens were upgraded, and whether build verification passed.
