## Debug Notes

This file documents small bugs and improvements that were identified and fixed in the project.

---

### 1. Enforce JWT secret configuration on the backend

- **File**: `backend/server.js`
- **Original behavior**:
  - The server allowed `JWT_SECRET` to be missing and only logged a warning.
  - When signing tokens, it used `JWT_SECRET || "development-secret-only"`, which meant that if the environment variable was not set, tokens were still issued using a predictable hard-coded string.
- **Problem**:
  - This is unsafe even for learning purposes because it hides configuration mistakes and relies on a weak fallback secret.
  - A forgotten `.env` configuration could silently result in insecure tokens.
- **Fix**:
  - The server now **fails fast** on startup if `JWT_SECRET` is missing:
    - Logs a clear fatal error.
    - Calls `process.exit(1)` to stop the process.
  - JWT signing always uses the configured `JWT_SECRET` and no longer falls back to any hard-coded value.
- **Outcome**:
  - If the environment is misconfigured, you see it immediately.
  - All issued tokens are signed with a proper, secret key from `.env`, which better reflects real-world practice.

---

### 2. Improve frontend error messages using backend validation details

- **Files**: `frontend/app.js`, backend validation in `backend/server.js`
- **Original behavior**:
  - The backend returns detailed validation errors in an `errors` array (e.g., "Email format is invalid.", "Password must be at least 8 characters long.").
  - The frontend only displayed the high-level `message` (e.g., "Validation failed.") or a generic fallback like "Login failed. Please try again."
- **Problem**:
  - Users did not see the specific validation reasons, which made debugging form issues harder.
  - The frontend was not fully leveraging the structured error information sent by the backend.
- **Fix**:
  - In both the registration and login handlers on the frontend:
    - Parse `data.message` when available.
    - If `data.errors` is an array with content, join those messages and append them to the displayed error text.
  - Example error now shown:
    - `"Validation failed. Email format is invalid. Password must be at least 8 characters long."`
- **Outcome**:
  - Form feedback is clearer and more helpful.
  - Frontend and backend validation behavior are aligned, improving the learning and debugging experience.

---

### How to use this file

- When you intentionally change behavior or fix a bug:
  - Add a small section here with:
    - **What was wrong**
    - **How it was fixed**
    - **Why the change is better**
- This keeps a simple, human-readable history of debugging work alongside the code.

