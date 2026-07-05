# Knowledge Embedded Reader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep users inside the H5 app when they open knowledge videos, articles, or external tests.

**Architecture:** Add a dedicated `/knowledge/external` route backed by a lightweight Vue reader view. Knowledge content source actions route to that page with encoded title, type, and URL query params; the reader renders the external page in an iframe and provides an in-app back action plus an explicit fallback link for sites that block embedding.

**Tech Stack:** Vue 3, Vue Router, Element Plus, Node test runner source checks, Vite build.

---

## Design

The knowledge page should stop calling `window.open` for knowledge sources. It should push to an internal route so the bottom app shell remains active and users can return via the reader header.

The reader view uses an iframe because it is the lowest-risk public beta change. If an external site refuses to render through `X-Frame-Options` or CSP, the app still shows a friendly fallback panel with an "open original" link. The app cannot reliably detect every frame-blocking response from browser JavaScript, so the fallback is always available below the iframe and a short loading hint stays visible until the iframe emits `load`.

## Tasks

### Task 1: Lock Behavior With Source Tests

**Files:**
- Modify: `frontend/tests/h5-redesign-ui.test.js`
- Test: `frontend/tests/h5-redesign-ui.test.js`

**Step 1: Write the failing test**

Add assertions that:
- Router defines `/knowledge/external`.
- `KnowledgeView.vue` imports `useRouter`.
- `openContentSource` calls `router.push`.
- `KnowledgeView.vue` no longer uses `window.open`.
- A reader view contains an iframe and fallback original-link action.

**Step 2: Run test to verify it fails**

Run: `node frontend/tests/h5-redesign-ui.test.js`

Expected: FAIL because the route and reader do not exist yet and `window.open` is still present.

### Task 2: Add Internal Reader Route and View

**Files:**
- Create: `frontend/src/views/knowledge/KnowledgeExternalView.vue`
- Modify: `frontend/src/router/index.js`

**Implementation:**
- Add route `/knowledge/external` named `KnowledgeExternal`.
- The view reads `url`, `title`, and `type` from `route.query`.
- It renders an app-style header, a back button, iframe, fallback copy, and original link.
- It returns to `/knowledge` when there is no history state to go back to.

**Step 3: Run test to verify it passes**

Run: `node frontend/tests/h5-redesign-ui.test.js`

Expected: PASS.

### Task 3: Route Knowledge Source Actions Internally

**Files:**
- Modify: `frontend/src/views/knowledge/KnowledgeView.vue`

**Implementation:**
- Import `useRouter`.
- Replace `window.open` in `startTest` and `openContentSource` with a shared internal navigation helper.
- Pass title, type, and URL as query params.
- Keep the detail dialog for local preview content.

**Step 4: Run frontend verification**

Run:
- `node frontend/tests/h5-redesign-ui.test.js`
- `node --test frontend/tests/*.test.js`
- `npm --prefix frontend run build`

Expected: All tests pass and build exits 0.
