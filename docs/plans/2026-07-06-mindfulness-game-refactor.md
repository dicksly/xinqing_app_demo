# Mindfulness Game Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current lightweight mindfulness Match-3 and Fruit Slice games with reference-inspired implementations while migrating all requested reference resources.

**Architecture:** Keep the existing Vue modal and Pinia progress integration. Move gameplay rules into testable utility modules, render the new interactions in the existing Vue components, and store full reference resources in public vendor directories for traceability and future reuse.

**Tech Stack:** Vue 3, Pinia, Element Plus, Vite, Node test runner, static public assets.

---

### Task 1: Migrate Reference Resources

**Files:**
- Create: `frontend/public/vendor/match-3-game-html5/`
- Create: `frontend/public/vendor/fruit-slash-saga/`

**Step 1: Copy assets**

Copy all non-development reference files from:

- `/tmp/xinqing-ref-match3/`
- `/tmp/xinqing-ref-fruit-saga/`

Exclude `.git`, `.idea`, `.DS_Store`, and dependency folders.

**Step 2: Verify resources**

Run:

```bash
find frontend/public/vendor/match-3-game-html5 frontend/public/vendor/fruit-slash-saga -type f | wc -l
test -f frontend/public/vendor/match-3-game-html5/LICENSE
test -f frontend/public/vendor/fruit-slash-saga/LICENSE.txt
test -f frontend/public/vendor/fruit-slash-saga/public/image/fruits/fruitbomb.png
```

Expected: files exist and count is nonzero.

### Task 2: Refactor Match-3 Engine With TDD

**Files:**
- Modify: `frontend/tests/mindfulness-games.test.js`
- Modify: `frontend/src/utils/match3-game.js`

**Step 1: Write failing tests**

Add tests for:

- `createMatch3Board()` returns an 8x8 board with no starting clusters and at least one valid swap.
- `resolveMatch3Swap(board, from, to)` only accepts adjacent swaps.
- Valid swaps clear clusters, collapse, refill, and return score.
- Invalid swaps leave board unchanged.

**Step 2: Run red test**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js
```

Expected: FAIL because the new swap API does not exist.

**Step 3: Implement minimal engine**

Implement:

- `MATCH3_KINDS`
- `createMatch3Board`
- `findMatch3Clusters`
- `findMatch3Moves`
- `hasAvailableMatch`
- `resolveMatch3Swap`
- compatibility wrapper `resolveMatch3Selection`

**Step 4: Run green test**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js
```

Expected: PASS.

### Task 3: Refactor Match-3 Vue Component

**Files:**
- Modify: `frontend/src/views/mindfulness/games/Match3Game.vue`
- Modify: `frontend/tests/h5-redesign-ui.test.js` or `frontend/tests/mindfulness-games.test.js`

**Step 1: Add source-level assertions**

Assert the component uses `resolveMatch3Swap`, exposes 8x8/classic copy, and no longer uses path selection as its main mechanic.

**Step 2: Implement UI**

Render:

- score, moves, cleared count
- 8x8 board
- selected tile state
- swap result messages
- shuffle/restart actions

**Step 3: Verify**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js frontend/tests/h5-redesign-ui.test.js
```

Expected: PASS.

### Task 4: Refactor Fruit Slice Engine With TDD

**Files:**
- Modify: `frontend/tests/mindfulness-games.test.js`
- Modify: `frontend/src/utils/fruit-slice-game.js`

**Step 1: Write failing tests**

Add tests for:

- `createFruitSlashRound()` produces falling fruit, bombs, and trophies.
- `advanceFruitSlashItems()` moves active objects downward.
- `sliceFruitSlashItems()` scores fruit, penalizes bombs, collects trophies, and avoids duplicate slicing.

**Step 2: Run red test**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js
```

Expected: FAIL because the new APIs do not exist.

**Step 3: Implement engine**

Implement reference-inspired falling item state with image paths pointing into `frontend/public/vendor/fruit-slash-saga/public/image/fruits/`.

**Step 4: Run green test**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js
```

Expected: PASS.

### Task 5: Refactor Fruit Slice Vue Component

**Files:**
- Modify: `frontend/src/views/mindfulness/games/FruitSliceGame.vue`
- Modify: `frontend/tests/h5-redesign-ui.test.js` or `frontend/tests/mindfulness-games.test.js`

**Step 1: Add source-level assertions**

Assert the component references Fruit Slash Saga vendor assets, level/trophy/bomb state, and swipe trail handling.

**Step 2: Implement UI**

Render:

- score, lives, level, trophies, combo
- falling fruit/bomb/trophy items using migrated assets
- swipe trail overlay
- round state messages and restart/close controls

**Step 3: Verify**

Run:

```bash
node --test frontend/tests/mindfulness-games.test.js frontend/tests/h5-redesign-ui.test.js
```

Expected: PASS.

### Task 6: Full Verification

Run:

```bash
node --test frontend/tests/*.test.js
npm --prefix frontend run build
git diff --check
```

Expected: all tests pass, build exits 0, no whitespace errors.
