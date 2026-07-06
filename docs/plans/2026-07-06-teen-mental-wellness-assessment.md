# Teen Mental Wellness Assessment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the simplified 5-item detailed psychological analysis with the 30-item Teen Mental Wellness Questionnaire from `docs/Questionnaire .docx`, and persist raw and scored responses.

**Architecture:** Keep the existing `/api/v1/psychological-assessments` endpoint and `psychological_assessments` table, extending them for the new scale. The frontend sends raw 0-4 item answers; the backend owns reverse scoring, total/subscale scoring, interpretation, and persistence.

**Tech Stack:** Vue 3, Element Plus, FastAPI, Pydantic v2, SQLAlchemy, MySQL/SQLite runtime migrations, Node test runner, Python unittest.

---

### Task 1: Backend Assessment Contract

**Files:**
- Modify: `backend/tests/test_app_iteration_api.py`
- Modify: `backend/tests/test_public_beta_schema_migration.py`
- Modify: `backend/app/schemas/schemas.py`
- Modify: `backend/app/models/models.py`
- Modify: `backend/app/api/v1/api.py`
- Modify: `backend/app/core/schema_migrations.py`

**Steps:**
1. Write failing tests for a 30-item payload with reverse scoring and subscale scores.
2. Run the targeted backend tests and confirm they fail against the old 5-item contract.
3. Add raw/scored/subscale fields, schema validation, scoring helpers, response fields, and runtime migration columns.
4. Run targeted backend tests until green.

### Task 2: Frontend Assessment Data Model

**Files:**
- Modify: `frontend/tests/iteration-engagement.test.js`
- Modify: `frontend/tests/h5-redesign-ui.test.js`
- Modify: `frontend/src/utils/assessment-questions.js`
- Modify: `frontend/src/utils/assessment.js`

**Steps:**
1. Write failing tests for 30 configurable questions, reverse scoring metadata, complete answer payload, and result normalization.
2. Implement question definitions from the docx, answer defaults, payload builder, and local scoring fallback.
3. Run targeted frontend tests until green.

### Task 3: Emotion Page UI

**Files:**
- Modify: `frontend/src/views/emotion/EmotionView.vue`

**Steps:**
1. Render the 30 questions grouped into five sections.
2. Replace sliders with 0-4 response buttons using localized labels.
3. Show total score, wellness state, interpretation, and subscale scores after submission.
4. Run frontend tests and production build.

### Task 4: Final Verification and Push

**Steps:**
1. Run full frontend tests: `node --test frontend/tests/*.test.js`.
2. Run full backend tests: `PYTHONPATH=backend backend/.venv/bin/python -m unittest discover backend/tests`.
3. Run production build: `npm --prefix frontend run build`.
4. Review `git diff`, commit all intended changes, and push `main`.
