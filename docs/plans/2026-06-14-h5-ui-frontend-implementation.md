# H5 UI Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the approved five-screen H5 redesign in the Vue frontend while preserving the current app behavior.

**Architecture:** Keep the existing Vue Router, Pinia stores, Element Plus dialogs, and page-level business logic. Replace the mobile shell, shared design tokens, and five main page templates/styles so the running app matches the Pencil UI direction and uses the generated image-2 icon assets.

**Tech Stack:** Vue 3, Vite, Pinia, Vue Router, Element Plus, CSS custom properties, Node test runner.

---

### Task 1: Add Redesign Guard Tests

**Files:**
- Create: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write failing source-level tests**

Assert that:
- App bottom navigation contains five public tabs and no profile tab.
- Profile is reachable from top controls.
- The five redesigned page anchor phrases exist.
- Image-2 icon assets are referenced by the frontend.

**Step 2: Run tests and confirm RED**

Run:

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js
```

Expected: FAIL because the current app shell still has the profile tab and pages have the old structure.

### Task 2: Add Frontend Icon Assets

**Files:**
- Create: `frontend/src/assets/icons/*.png`

**Step 1: Copy generated icon assets**

Copy the selected transparent `designs/icons/image2-*.png` files into frontend assets.

Expected: Vite can bundle the icons through static imports.

### Task 3: Redesign App Shell And Tokens

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/styles/global.css`

**Step 1: Implement shell**

Use five bottom nav items:
- 首页
- 情绪
- 正念
- 树洞
- 知识

Move profile into the top utility controls, keep language and theme actions, and remove persistent share from the shell.

**Step 2: Implement tokens**

Set the approved warm palette and shared app classes for:
- page shell
- cards
- buttons
- chips
- segmented controls
- image-2 icon wrappers

### Task 4: Redesign Five Main Views

**Files:**
- Modify: `frontend/src/views/home/HomeView.vue`
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Step 1: Replace templates and scoped styles**

Match the approved Pencil UI hierarchy:
- Home daily care dashboard.
- Emotion guided check-in.
- Mindfulness practice player.
- Treehole private composer and square.
- Knowledge content hub.

**Step 2: Preserve behavior**

Keep existing:
- Emotion check-in submit, weekly report, insights, and assessment dialog.
- Mindfulness audio session, breathing timer, game dialogs, and login dialog.
- Treehole submit, voice/image tools, privacy controls, AI response, feed, detail dialog, and deletion.
- Knowledge API loading, tabs, content dialogs, and test dialog.

### Task 5: Verify And Commit

**Files:**
- Test all touched frontend files.

**Step 1: Run source tests**

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js tests/iteration-engagement.test.js tests/treehole-composer.test.js tests/knowledge-view-data.test.js tests/theme-contrast.test.js
```

Expected: PASS.

**Step 2: Run build**

```bash
cd frontend && npm run build
```

Expected: PASS.

**Step 3: Inspect in browser**

Run:

```bash
cd frontend && npm run dev -- --host 127.0.0.1
```

Inspect `/home`, `/emotion`, `/mindfulness`, `/treehole`, and `/knowledge` at a 390px mobile viewport.

Expected: No clipped text, bottom navigation has five items, and primary actions remain usable.

**Step 4: Commit**

```bash
git add docs/plans/2026-06-14-h5-ui-frontend-implementation.md frontend
git commit -m "feat: implement h5 redesign"
```
