# App MVP Iteration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the approved MVP iteration from the docs: grass-mascot companion home, emotion quote poster, simplified mindfulness, interactive local treehole, linked knowledge content, hidden admin entry, font-size settings, and streak guards.

**Architecture:** Keep the implementation local-first and frontend-heavy, using existing stores, utility modules, and H5 page components. Backend changes are avoided in this pass except for future-compatible data shapes because the requested MVP can be demonstrated with local persistence and existing APIs.

**Tech Stack:** Vue 3, Pinia, Element Plus, Vite, Node test runner, existing FastAPI backend contracts.

---

### Task 1: Engagement And Sprout State Utilities

**Files:**
- Modify: `frontend/src/utils/engagement.js`
- Create: `frontend/src/utils/sprout-care.js`
- Test: `frontend/tests/iteration-engagement.test.js`

**Step 1: Write the failing tests**

Add tests that prove:

- `updateStreakState` clamps impossible jumps and does not convert a legacy/current streak directly to 20.
- sprout care state grants sun drops once per daily care action.
- feed/wash/outing/comfort actions persist counts and update mood text.

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend && node --test tests/iteration-engagement.test.js
```

Expected: FAIL because `sprout-care.js` does not exist and streak guard behavior is not present.

**Step 3: Implement minimal utilities**

Implement:

- `normalizeEngagementState(state, now)`
- guarded `updateStreakState`
- `createDefaultSproutCareState`
- `applySproutCareAction(state, action, now)`
- `getSproutMilestone(streakDays)`

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend && node --test tests/iteration-engagement.test.js
```

Expected: PASS.

### Task 2: Home Companion Page

**Files:**
- Modify: `frontend/src/views/home/HomeView.vue`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write the failing test**

Add assertions that the home page includes:

- `烦恼小芽成长计划`
- `阳光露珠`
- `喂食`
- `洗澡`
- `出门`
- `互动`

Also assert that the old shortcut titles are absent from the first-screen home template.

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js
```

Expected: FAIL because the page still contains shortcut cards.

**Step 3: Implement the home template and styles**

Replace the shortcut grid with:

- companion hero;
- sun drop stat;
- care action row;
- growth track;
- daily task card.

Use existing `homeLogo` and H5 tokens.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js tests/iteration-engagement.test.js
```

Expected: PASS.

### Task 3: Emotion Daily Quote Poster

**Files:**
- Create: `frontend/src/utils/mood-quote-card.js`
- Modify: `frontend/src/views/emotion/EmotionView.vue`
- Test: `frontend/tests/iteration-engagement.test.js`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write the failing tests**

Add tests that:

- `getMoodQuoteCard('anxious')` returns a quote and illustration tone.
- emotion page contains `日签语录`, `保存日签`, and `分享`.

**Step 2: Run tests to verify failure**

Run:

```bash
cd frontend && node --test tests/iteration-engagement.test.js tests/h5-redesign-ui.test.js
```

Expected: FAIL because quote-card utility and UI are missing.

**Step 3: Implement**

Add:

- mood quote mapping;
- quote poster dialog after successful `handleSubmit`;
- save/share button handlers with graceful fallback.

**Step 4: Run tests**

Run the same command.

Expected: PASS.

### Task 4: Mindfulness Material And Game Entries

**Files:**
- Modify: `frontend/src/utils/meditation-themes.js`
- Modify: `frontend/src/views/mindfulness/MindfulnessView.vue`
- Test: `frontend/tests/iteration-engagement.test.js`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write the failing tests**

Assert:

- monthly themes include `sourceUrl` and the January/December URLs from the doc.
- duration tabs are 5/10/20.
- primary games are `消消乐` and `切水果`.

**Step 2: Run tests to verify failure**

Run:

```bash
cd frontend && node --test tests/iteration-engagement.test.js tests/h5-redesign-ui.test.js
```

Expected: FAIL.

**Step 3: Implement**

Update theme data with source URLs, change durations, simplify game strip to two MVP game cards, and keep existing audio/tick behavior.

**Step 4: Run tests**

Expected: PASS.

### Task 5: Treehole Local Interactions And Safety Hint

**Files:**
- Modify: `frontend/src/utils/treehole-feed.js`
- Create: `frontend/src/utils/treehole-interactions.js`
- Modify: `frontend/src/views/treehole/TreeholeView.vue`
- Test: `frontend/tests/treehole-feed.test.js`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write failing tests**

Assert:

- local interaction state can like an entry once and add comments/replies.
- sensitive content detection marks severe wording.
- treehole page contains `点赞`, `评论`, and `回复`.

**Step 2: Run tests**

Run:

```bash
cd frontend && node --test tests/treehole-feed.test.js tests/h5-redesign-ui.test.js
```

Expected: FAIL.

**Step 3: Implement**

Add local storage backed interaction helpers, add controls in list/detail, and warn/force private on severe text.

**Step 4: Run tests**

Expected: PASS.

### Task 6: Knowledge Links And SBTI

**Files:**
- Create: `frontend/src/utils/knowledge-materials.js`
- Modify: `frontend/src/views/knowledge/knowledge-public-data.js`
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`
- Test: `frontend/tests/knowledge-view-data.test.js`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write failing tests**

Assert:

- fallback materials include 12 video and 12 article links.
- SBTI URL is exposed.
- UI contains `SBTI` and not simplified MBTI fallback copy.

**Step 2: Run tests**

Run:

```bash
cd frontend && node --test tests/knowledge-view-data.test.js tests/h5-redesign-ui.test.js
```

Expected: FAIL.

**Step 3: Implement**

Merge fallback material links when API data is empty, update feature card and click behavior to open SBTI.

**Step 4: Run tests**

Expected: PASS.

### Task 7: Profile Advanced Settings And Font Scale

**Files:**
- Modify: `frontend/src/styles/global.css`
- Modify: `frontend/src/views/profile/ProfileView.vue`
- Test: `frontend/tests/h5-redesign-ui.test.js`
- Optional Test: create `frontend/tests/profile-settings.test.js`

**Step 1: Write failing tests**

Assert:

- direct `openPage('admin')` menu item is not in the main menu markup.
- settings contains `高级入口` and `字号大小`.
- global CSS has font-scale hooks.

**Step 2: Run tests**

Run:

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js
```

Expected: FAIL.

**Step 3: Implement**

Move admin access into settings, add font-size segmented control, persist settings, and apply root `data-font-scale`.

**Step 4: Run tests**

Expected: PASS.

### Task 8: Final Verification

**Files:**
- No source edits unless verification exposes issues.

**Step 1: Run frontend tests**

```bash
cd frontend && node --test tests/h5-redesign-ui.test.js tests/iteration-engagement.test.js tests/treehole-feed.test.js tests/treehole-composer.test.js tests/knowledge-view-data.test.js tests/theme-contrast.test.js
```

Expected: all pass.

**Step 2: Run build**

```bash
cd frontend && npm run build
```

Expected: exit 0. Large chunk warning is acceptable if unchanged.

**Step 3: Browser verification**

Run local Vite app and verify on mobile viewport:

- `/home`: companion home without old module grid.
- `/emotion`: quote poster appears after check-in.
- `/mindfulness`: 5/10/20 and two game entries.
- `/treehole`: local comment/like/reply works.
- `/knowledge`: SBTI and material links are visible.
- `/profile`: admin hidden in main menu and font size setting works.

Expected: no horizontal overflow and primary flows usable.
