# App Iteration Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add backend support for streak engagement, mascot unlocks, mood comfort insights, detailed psychological analysis consent/questionnaire, monthly mindfulness themes, and soap replay skin rotation.

**Architecture:** Keep the demo API lightweight and compatible with anonymous usage. Persist engagement state and detailed assessments by `client_id`, expose deterministic content/config endpoints, and keep game cut rendering on the frontend while the backend provides replay skin selection.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic v2, SQLite, unittest/TestClient.

---

### Task 1: Engagement State

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_app_iteration_api.py`

**Steps:**
1. Write failing tests for `POST /api/v1/engagement/check-in`.
2. Add an `EngagementState` table keyed by `client_id`.
3. Implement streak calculation, level unlocks at 1/20/50/100 days, mood-driven mascot expression, and missed-day return prompt.
4. Run the targeted backend test.

### Task 2: Mood Insights

**Files:**
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_app_iteration_api.py`

**Steps:**
1. Write failing tests for `GET /api/v1/emotion-insights/{mood}`.
2. Add shared mood tag and comfort copy mapping.
3. Return a fallback for unknown mood values.

### Task 3: Detailed Psychological Analysis

**Files:**
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_app_iteration_api.py`

**Steps:**
1. Write failing tests for consent validation and scoring on `POST /api/v1/psychological-assessments`.
2. Add `PsychologicalAssessment` persistence with consent version and typed signatures.
3. Validate accepted consent, user signature, and guardian signature for minors.
4. Return score, level, diagnosis summary, suggestions, and anonymized usage statement.

### Task 4: Mindfulness Themes And Soap Round

**Files:**
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/api/v1/api.py`
- Test: `backend/tests/test_app_iteration_api.py`

**Steps:**
1. Write failing tests for 12 monthly themes and soap replay skin rotation.
2. Add `GET /api/v1/mindfulness/monthly-themes`.
3. Add `POST /api/v1/games/soap/round` that returns a skin different from current when alternatives exist.

### Task 5: Migration And Verification

**Files:**
- Modify: `backend/main.py`
- Test: `backend/tests/test_app_iteration_migration.py`

**Steps:**
1. Write failing migration tests for old SQLite files.
2. Add schema backfill helpers for new tables.
3. Run targeted tests, then full backend unittest discovery.
