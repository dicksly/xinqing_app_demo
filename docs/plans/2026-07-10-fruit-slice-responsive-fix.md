# Fruit Slice Responsive Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the Fruit Slice dialog, controls, and arena usable on short mobile viewports while reducing its initial production payload.

**Architecture:** Keep the existing Vue component and Element Plus dialog integration. Move the dialog overlay out of the app shell stacking context with Element Plus's `append-to-body` prop, constrain the modal with global dynamic viewport CSS, and let only the arena shrink. Keep all vendor assets in the repository while loading result audio on demand.

**Tech Stack:** Vue 3, Element Plus, CSS dynamic viewport units, Node test runner, Vite.

---

### Task 1: Add the responsive-dialog regression test

**Files:**
- Modify: `frontend/tests/mindfulness-games.test.js`

**Step 1: Write the failing test**

Import `readFileSync` and read these source files:

```js
const mindfulnessViewSource = readFileSync(new URL('../src/views/mindfulness/MindfulnessView.vue', import.meta.url), 'utf8')
const fruitSliceViewSource = readFileSync(new URL('../src/views/mindfulness/games/FruitSliceGame.vue', import.meta.url), 'utf8')
const globalStyleSource = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
```

Add a test that requires:

```js
assert.match(mindfulnessViewSource, /<el-dialog[\s\S]{0,320}\bappend-to-body\b[\s\S]{0,320}class="game-dialog"/)
assert.match(mindfulnessViewSource, /:global\(\.game-dialog\)[\s\S]{0,220}max-height:\s*calc\(100dvh/)
assert.match(fruitSliceViewSource, /height:\s*clamp\(240px,\s*45dvh,\s*368px\)/)
assert.doesNotMatch(fruitSliceViewSource, /<audio[^>]+preload="auto"/)
assert.equal((fruitSliceViewSource.match(/preload="none"/g) || []).length, 3)
assert.match(globalStyleSource, /body:has\(\.game-dialog\)\s+\.bottom-nav/)
```

**Step 2: Run the test to verify it fails**

Run: `node --test frontend/tests/mindfulness-games.test.js`

Expected: FAIL because the dialog is not teleported, the arena is fixed at 368px, audio preloads eagerly, and no modal navigation suppression exists.

### Task 2: Implement the minimal responsive fix

**Files:**
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/views/mindfulness/games/FruitSliceGame.vue`
- Modify: `frontend/src/styles/global.css`

**Step 1: Teleport and constrain the dialog**

Add the `append-to-body` prop to the game `el-dialog`. Because the dialog is moved outside the scoped component DOM, extend the component styles with global selectors:

```css
:global(.game-dialog) {
  max-height: calc(100dvh - 24px);
  margin: max(12px, env(safe-area-inset-top, 0px)) auto max(12px, env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
}

:global(.game-dialog .el-dialog__header) {
  flex: 0 0 auto;
}

:global(.game-dialog .el-dialog__body) {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**Step 2: Shrink only the game arena on short screens**

Change the arena height to:

```css
height: clamp(240px, 45dvh, 368px);
```

**Step 3: Suppress the app navigation behind the game overlay**

Add to global styles:

```css
body:has(.game-dialog) .bottom-nav {
  opacity: 0;
  pointer-events: none;
}
```

**Step 4: Load result audio only when needed**

Change all three result audio elements from `preload="auto"` to `preload="none"`.

**Step 5: Run the focused tests**

Run: `node --test frontend/tests/mindfulness-games.test.js frontend/tests/h5-redesign-ui.test.js`

Expected: PASS with 32 tests and zero failures.

**Step 6: Commit**

```bash
git add frontend/tests/mindfulness-games.test.js frontend/src/views/mindfulness/MindfulnessView.vue frontend/src/views/mindfulness/games/FruitSliceGame.vue frontend/src/styles/global.css docs/plans/2026-07-10-fruit-slice-responsive-fix.md
git commit -m "fix: make fruit slice dialog mobile safe"
```

### Task 3: Verify build and browser behavior

**Files:**
- No additional source changes expected.

**Step 1: Run the production build**

Run: `npm --prefix frontend run build`

Expected: Vite exits 0.

**Step 2: Check repository whitespace**

Run: `git diff --check HEAD^`

Expected: no output and exit 0.

**Step 3: Verify mobile layouts**

Open `/mindfulness`, launch Fruit Slice, and inspect 390x844 and 390x667 viewports. Confirm:

- the overlay is attached under `body`;
- the dialog top and bottom stay within the viewport;
- `.game-actions` stays within the dialog and can be clicked;
- `.bottom-nav` is hidden while the dialog is open;
- slicing a fruit still increases the score.

### Task 4: Integrate and deploy

**Files:**
- Integrate only the commits created by this plan into local `main`.

**Step 1: Preserve unrelated local changes**

Apply the fix commit to the main worktree and stage only the patch from this branch. Verify the existing breathing-vibration changes remain unstaged and unchanged.

**Step 2: Build the exact main revision for production**

Run the frontend build from the integrated revision and deploy `frontend/dist` to `/opt/xinqing_app_demo/frontend/dist` on the production server.

**Step 3: Verify production**

Check the production HTML/chunk responses, Fruit Slash asset responses, and the two mobile viewport layouts. Confirm the deployed version contains the teleport, responsive arena, and lazy audio changes.
