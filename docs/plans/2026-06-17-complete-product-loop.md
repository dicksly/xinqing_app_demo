# Complete Product Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the approved local-first product loop for the H5 app: richer grass companion care, playable mindfulness games, backend-backed psychological assessment submission, and a demo-safe password recovery flow.

**Architecture:** Keep the current Vue 3 + Pinia + Element Plus frontend and FastAPI backend. Put deterministic product logic in small `frontend/src/utils/*.js` modules with Node tests, wire the UI to those modules, and use backend APIs only where persistence already exists or is required by the docs. Features that require external services or licensed media are represented as clear, testable hooks rather than fake integrations.

**Tech Stack:** Vue 3, Vite, Pinia, Element Plus, Node `node:test`, FastAPI, SQLAlchemy, unittest/TestClient.

---

### Task 1: Expand Grass Companion State

**Files:**
- Modify: `frontend/src/utils/sprout-care.js`
- Modify: `frontend/src/views/home/HomeView.vue`
- Test: `frontend/tests/iteration-engagement.test.js`

**Step 1: Write failing tests**

Add tests for:
- day 3 unlocks one accessory blind box
- day 21 unlocks habitat and daily supplies
- planting forget-worry grass spends sun drops and creates a garden plot
- diary entries are preserved with date, title, and mood

Run: `cd frontend && node --test tests/iteration-engagement.test.js`
Expected: FAIL because new helper functions are missing.

**Step 2: Implement minimal utilities**

Add deterministic helpers:
- `getUnlockedSproutFeatures(streakDays)`
- `claimSproutMilestoneReward(state, streakDays, now, random)`
- `equipSproutAccessory(state, accessoryId)`
- `plantSproutGardenItem(state, seedId, now)`
- `addSproutDiaryEntry(state, entry, now)`

Run the same test until it passes.

**Step 3: Wire Home UI**

Add compact cards for:
- accessory/outfit strip
- habitat and supplies
- garden planting
- diary/memory wall

Persist state under existing `xinqing_sprout_care_state`.

### Task 2: Submit Detailed Psychological Assessment To Backend

**Files:**
- Modify: `frontend/src/api/index.js`
- Modify: `frontend/src/utils/assessment.js`
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Test: `frontend/tests/iteration-engagement.test.js`
- Existing backend coverage: `backend/tests/test_app_iteration_api.py`

**Step 1: Write failing frontend tests**

Add tests for:
- assessment answers convert slider `0-4` values to backend `1-5`
- consent payload includes `clientId`, `consentAccepted`, `userSignature`, `isMinor`, `guardianSignature`, and `answers`
- response result can be normalized for display

Run: `cd frontend && node --test tests/iteration-engagement.test.js`
Expected: FAIL because payload builders are missing.

**Step 2: Implement helpers and API method**

Add:
- `buildAssessmentPayload(consent, answers, clientId)`
- `normalizeAssessmentResult(response)`
- `emotionApi.submitAssessment(data)`

Update the dialog to call `/psychological-assessments`, then fall back to local scoring if the API is unavailable.

### Task 3: Add Demo-Safe Password Recovery

**Files:**
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Modify: `frontend/src/api/index.js`
- Modify: `frontend/src/components/auth/AuthDialog.vue`
- Test: `backend/tests/test_admin_auth.py` or new focused backend test file

**Step 1: Write failing backend tests**

Add tests for:
- requesting recovery for an existing username returns a demo reset code
- confirming recovery with the code changes the password
- old password is rejected and new password logs in

Run: `cd backend && python -m pytest tests/test_admin_auth.py`
Expected: FAIL because password recovery endpoints do not exist.

**Step 2: Implement backend endpoints**

Use demo-only in-memory reset codes:
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`

Return the demo code in the request response with a clear `delivery: "demo"` field. This avoids pretending email is configured.

**Step 3: Wire frontend dialog**

Add a “忘记密码” mode in `AuthDialog.vue`:
- username/email input
- request code button
- reset code + new password inputs
- confirm reset and return to login

### Task 4: Replace Mindfulness Game Placeholders

**Files:**
- Create: `frontend/src/utils/match3-game.js`
- Create: `frontend/src/utils/fruit-slice-game.js`
- Create: `frontend/src/views/mindfulness/games/Match3Game.vue`
- Create: `frontend/src/views/mindfulness/games/FruitSliceGame.vue`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/stores/games.js`
- Test: new `frontend/tests/mindfulness-games.test.js`

**Step 1: Write failing utility tests**

Add tests for:
- match-3 board creation has no immediate dead state
- selecting adjacent same-kind cells clears a group and refills
- fruit slice round spawns fruit, ignores calm stones, and scores only sliced fruit

Run: `cd frontend && node --test tests/mindfulness-games.test.js`
Expected: FAIL because game modules do not exist.

**Step 2: Implement utilities**

Keep engines small and deterministic with injectable random functions.

**Step 3: Implement game components**

Build touch-friendly H5 games:
- Match-3: 6x6 tile board, tap/drag path, combo score, move counter
- Fruit Slice: timed arena, pointer slicing, avoid stones, score/combo feedback

Update game store with `match3` and `fruit-slice` progress.

### Task 5: Improve Mindfulness Audio Fallback

**Files:**
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Modify: `frontend/src/utils/meditation-themes.js`
- Test: add source checks in `frontend/tests/iteration-engagement.test.js`

**Step 1: Write tests**

Check that monthly themes expose source URLs and local audio paths, and that UI contains a Web Speech fallback notice/hook.

**Step 2: Implement fallback**

If voice audio file cannot play, use browser speech synthesis for short guidance text. Keep YouTube links as source attribution; do not download copyrighted music.

### Task 6: Verification

**Commands:**
- `cd frontend && node --test tests/*.test.js`
- `cd frontend && npm run build`
- `cd backend && python -m pytest tests`
- Start or reuse local dev server, then inspect `/home`, `/emotion`, `/mindfulness`, and auth dialog in the in-app browser.

**Expected:** All tests pass, build succeeds, and the upgraded flows are visually usable on the H5 viewport.
