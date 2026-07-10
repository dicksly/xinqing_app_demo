# Breathing Vibration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add haptic vibration cues to the mindfulness 4-7-8 breathing exercise.

**Architecture:** Reuse the existing browser Vibration API wrapper in `frontend/src/utils/vibration.js`. Wire it into the breathing phase transitions in `MindfulnessView.vue` without changing the breathing timer structure or game vibration behavior.

**Tech Stack:** Vue 3, Vite, Node `node:test`, existing `vibrationHelper`.

---

### Task 1: Add Regression Coverage

**Files:**
- Modify: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write the failing test**

Add a source-level test that asserts:
- `MindfulnessView.vue` imports `vibrationHelper`.
- The breathing cycle calls `vibrationHelper.short()` for inhale, hold, and exhale.
- The completion path calls `vibrationHelper.double()`.
- The stop path calls `vibrationHelper.stop()`.

**Step 2: Run test to verify it fails**

Run:

```bash
node --test frontend/tests/h5-redesign-ui.test.js
```

Expected: FAIL because `MindfulnessView.vue` has not imported or used `vibrationHelper`.

### Task 2: Implement Haptic Cues

**Files:**
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`

**Step 1: Write minimal implementation**

Import `vibrationHelper` from `../../utils/vibration`.

Call:
- `vibrationHelper.short()` after setting inhale state.
- `vibrationHelper.short()` after setting hold state.
- `vibrationHelper.short()` after setting exhale state.
- `vibrationHelper.double()` when the training completes.
- `vibrationHelper.stop()` in `stopBreathingCycle()`.

**Step 2: Run targeted verification**

Run:

```bash
node --test frontend/tests/h5-redesign-ui.test.js
```

Expected: PASS.

### Task 3: Full Verification

Run:

```bash
node --test frontend/tests/*.test.js
npm --prefix frontend run build
```

Expected: all frontend tests pass and the production build exits 0.
