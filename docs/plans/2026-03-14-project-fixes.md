# Project Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the confirmed project issues around database initialization, broken startup scripts, and API base URL/CORS handling without broad refactoring.

**Architecture:** Keep the existing app structure and correct initialization order at the source of the bugs. Add narrow regression tests first, then make minimal implementation changes so the runtime configuration, script path resolution, and API URL handling all match expected behavior.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic Settings, shell scripts, Vue/Vite, Node test runner, Python unittest

---

### Task 1: Lock down database initialization behavior

**Files:**
- Modify: `backend/tests/test_config.py`
- Modify: `backend/main.py`

**Step 1: Write the failing test**

Add a test that imports `main` and asserts the SQLAlchemy engine URL matches `settings.DATABASE_URL`.

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_config`
Expected: FAIL because `engine.url` still points to `sqlite:///./xinqing.db`

**Step 3: Write minimal implementation**

Move the persistent database URL setup ahead of database engine creation so importing `main` yields a consistent engine and settings value.

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_config`
Expected: PASS

### Task 2: Lock down standalone startup scripts

**Files:**
- Modify: `backend/tests/test_config.py`
- Modify: `start-backend.sh`
- Modify: `start-frontend.sh`

**Step 1: Write the failing test**

Add a test that computes the current script-root expectation and verifies the existing shell logic points at the repository root, not its parent.

**Step 2: Run test to verify it fails**

Run: `./venv/bin/python -m unittest tests.test_config`
Expected: FAIL because the current script logic resolves to the parent directory.

**Step 3: Write minimal implementation**

Use the script directory itself as `PROJECT_DIR` in both shell scripts.

**Step 4: Run test to verify it passes**

Run: `./venv/bin/python -m unittest tests.test_config`
Expected: PASS

### Task 3: Verify API base URL and CORS fixes stay covered

**Files:**
- Modify: `frontend/tests/api-base-url.test.js` if needed
- Verify: `frontend/src/api/base-url.js`
- Verify: `frontend/src/api/index.js`
- Verify: `backend/app/core/config.py`
- Verify: `backend/main.py`

**Step 1: Run focused tests**

Run: `node --test frontend/tests/api-base-url.test.js`
Expected: PASS

**Step 2: Run backend config tests**

Run: `./venv/bin/python -m unittest tests.test_config`
Expected: PASS with CORS-related assertions still green.

**Step 3: Verify shell behavior**

Run: `./start-backend.sh` and `./start-frontend.sh`
Expected: No immediate `cd ... No such file or directory` failure.
