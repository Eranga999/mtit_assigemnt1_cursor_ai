## Project Documentation – JWT Auth Demo

This document explains the structure, behavior, and key design choices of the authentication demo project implemented with a Node.js/Express backend and a HTML/CSS/JavaScript frontend.

---

### 1. High-Level Overview

- **Goal**: Demonstrate a simple but realistic authentication flow with:
  - User registration and login
  - Password hashing with bcrypt
  - JWT-based authentication
  - Clean separation between backend API and frontend UI
- **Security scope**:
  - Suitable for learning and local demos.
  - Uses in-memory storage instead of a database (no persistence).
  - Emphasizes good practices like secure password hashing, env-based secrets, and explicit validation.

---

### 2. Project Structure

- `backend/`
  - `server.js` – Express server, routes, validation, JWT logic, in-memory users.
  - `package.json` – Node project configuration and dependencies.
  - `.env.example` – Template for environment variables (`JWT_SECRET`, `PORT`).
- `frontend/`
  - `index.html` – Login and registration UI.
  - `styles.css` – Visual styling, centered layout, responsive tweaks.
  - `app.js` – Client-side logic, form handling, validation, and API calls.
- Root files:
  - `README.md` – Setup instructions and API usage.
  - `debugnote.md` – Notes on identified bugs and fixes.
  - `AIdocumentation.md` – This document.

---

### 3. Backend Documentation (`backend/server.js`)

#### 3.1. Core Technologies

- **Node.js + Express** – HTTP server and routing.
- **bcrypt** – Password hashing and verification.
- **jsonwebtoken (JWT)** – Token creation for authenticated sessions.
- **dotenv** – Loads `.env` variables.
- **cors** – Enables cross-origin requests from the frontend.

#### 3.2. Configuration and Startup

- The backend reads:
  - `PORT` from `process.env.PORT` (default `5000`).
  - `JWT_SECRET` from `process.env.JWT_SECRET`.
- If `JWT_SECRET` is missing, the server logs a **fatal error** and exits:
  - This prevents issuing tokens with a weak or missing secret.
- `app.use(cors())` and `app.use(express.json())` configure CORS and JSON body parsing.

#### 3.3. In-Memory User Store

- Users are stored in an array:
  - Structure: `{ id, username, email, passwordHash, createdAt }`.
  - This is **not persistent**: data is lost when the server restarts.
  - Intended for learning, not production.

#### 3.4. Input Validation Logic

- Helper function `validateAuthPayload({ email, password, username }, { requireUsername })`:
  - Ensures required fields are present and non-empty.
  - Checks email format via a basic regex.
  - Enforces minimum password length (8+ characters).
  - Optionally requires `username` when `requireUsername` is `true` (for registration).
- Returns an array of error messages used in responses.

#### 3.5. Endpoint: `POST /register`

- **Purpose**: Create a new user account.
- **Request body (JSON)**:
  - `username` – required, non-empty.
  - `email` – required, non-empty, valid format.
  - `password` – required, non-empty, min 8 characters.
- **Flow**:
  1. Validate payload with `validateAuthPayload` (with `requireUsername: true`).
  2. Normalize email and username (trim, lowercase email).
  3. Check the in-memory `users` array for:
     - Existing account with same email.
     - Existing account with same username (case-insensitive).
  4. If duplicate found, respond with `409 Conflict`.
  5. Hash password using `bcrypt.hash(password, 10)`.
  6. Create user object, push into `users`.
  7. Respond with `201 Created` and a success message.
- **Error handling**:
  - Validation failures → `400 Bad Request` with `errors` array.
  - Duplicate user → `409 Conflict`.
  - Unexpected errors → `500 Internal Server Error`.

#### 3.6. Endpoint: `POST /login`

- **Purpose**: Authenticate a user and issue a JWT.
- **Request body (JSON)**:
  - `email` – required, valid format.
  - `password` – required, min 8 characters.
- **Flow**:
  1. Validate payload with `validateAuthPayload` (username not required).
  2. Normalize email and look up user in `users` by email.
  3. If no user, respond with `401 Unauthorized`.
  4. Compare password with `bcrypt.compare(password, user.passwordHash)`.
  5. If mismatch, respond with `401 Unauthorized`.
  6. If valid, create a JWT using `jwt.sign` with:
     - Payload: `{ id, username, email }`.
     - Secret: `JWT_SECRET`.
     - Expiration: `1h`.
  7. Respond with `200 OK`, a success message, and `token`.
- **Error handling**:
  - Validation failures → `400 Bad Request` with `errors` array.
  - Invalid credentials → `401 Unauthorized`.
  - Unexpected errors → `500 Internal Server Error`.

#### 3.7. Health Check: `GET /`

- Returns a simple JSON message `{"message": "Auth API is running."}` for quick status checks.

---

### 4. Frontend Documentation (`frontend/`)

#### 4.1. HTML Structure (`index.html`)

- **Main components**:
  - A centered `.auth-card` containing:
    - Tab buttons:
      - `#tab-login` – switches to login form.
      - `#tab-register` – switches to registration form.
    - Message area:
      - `#messages` – displays success and error messages.
    - Forms:
      - `#login-form`
        - Fields: `email`, `password`.
        - Submit button: `#login-submit`.
      - `#register-form`
        - Fields: `username`, `email`, `password`.
        - Submit button: `#register-submit`.
    - Token display:
      - `#token-container` – hidden by default, shows after login.
      - `#token-output` – displays the JWT token from the backend.
- **Behavior**:
  - Only one form is visible at a time (`.form.active` class).
  - The token container is shown only when a token is available.

#### 4.2. Styling (`styles.css`)

- Uses a **radial gradient** background and a centered card layout.
- The auth card:
  - Rounded corners, drop shadow, and max width for small/medium screens.
  - Tabs styled as pill buttons with active state highlighting.
- Forms:
  - Clean labels and inputs with focus outlines.
  - Primary button with gradient, hover/active effects, and disabled state.
- Message area:
  - `.message.success` and `.message.error` with distinct colors and borders.
- Token container:
  - Uses a `<pre>` with dark background and scrollable area for long tokens.
- Responsive behavior:
  - Slight padding adjustments for narrow screens.

#### 4.3. Client Logic (`app.js`)

##### 4.3.1. Configuration and DOM references

- `API_BASE_URL` is set to `http://localhost:5000` to match the backend.
- Grabs references to tabs, forms, buttons, message area, and token elements using `document.getElementById`.

##### 4.3.2. Tab Switching

- `switchTab("login" | "register")`:
  - Toggles the `active` class on:
    - Tabs (`#tab-login`, `#tab-register`).
    - Forms (`#login-form`, `#register-form`).
  - Clears any existing messages.
- Event listeners:
  - `tabLogin` click → `switchTab("login")`.
  - `tabRegister` click → `switchTab("register")`.

##### 4.3.3. Message Handling

- `showMessage(type, text)`:
  - Shows a single message (`success` or `error`) inside `#messages`.
- `clearMessages()`:
  - Hides and clears the messages container.

##### 4.3.4. Client-Side Validation

- `validateEmail(email)`:
  - Uses the same basic regex pattern as the backend for consistency.
- `validatePassword(password)`:
  - Checks that the password string is at least 8 characters long.
- Forms perform validation **before** sending a request:
  - Ensures all fields are filled.
  - Confirms email format and password length.

##### 4.3.5. Registration Flow (`POST /register`)

- Event listener on `#register-form` `submit`:
  1. Prevent default form submission.
  2. Read `username`, `email`, and `password`.
  3. Run client-side validations; show errors if invalid.
  4. Disable the register button and change text to “Creating account...”.
  5. `fetch` to `${API_BASE_URL}/register` with JSON body.
  6. Parse JSON response and:
     - If not `response.ok`:
       - Combine `data.message` and any `data.errors` into a user-friendly error.
     - If ok:
       - Show success message, reset form fields.
  7. Re-enable the button and restore label.
- Errors:
  - Network or unexpected errors show a generic “Network error” message.

##### 4.3.6. Login Flow (`POST /login`)

- Event listener on `#login-form` `submit`:
  1. Prevent default form submission.
  2. Read `email` and `password`.
  3. Run client-side validations; show errors if invalid.
  4. Disable the login button and change text to “Logging in...”.
  5. `fetch` to `${API_BASE_URL}/login` with JSON body.
  6. Parse JSON response and:
     - If not `response.ok`:
       - Combine `data.message` and any `data.errors` for feedback.
       - Hide token container and clear any old token text.
     - If ok:
       - Show success message.
       - If `data.token` exists:
         - Display it in `#token-output` and show `#token-container`.
  7. Re-enable the button and restore label.
- Errors:
  - Network or unexpected errors show a “Network error” message and hide token output.

---

### 5. Security and Design Considerations

- **Passwords**:
  - Always stored as bcrypt hashes (never plaintext).
  - This mirrors real-world password storage practices.
- **JWT secret**:
  - Required environment variable (`JWT_SECRET`) ensures proper signing.
  - No fallback development secret is used when missing.
- **Validation**:
  - Both frontend and backend validate user input.
  - Backend is the source of truth; frontend mainly improves UX.
- **Error handling**:
  - Uses appropriate HTTP status codes (`400`, `401`, `409`, `500`).
  - Client surfaces detailed backend validation messages where available.
- **In-memory store**:
  - Intentional tradeoff for simplicity; highlight that production systems must use a persistent database and additional hardening (HTTPS, secure cookies, rate limiting, logging, etc.).

---

### 6. How to Extend This Project

- Add a database (e.g., PostgreSQL, MongoDB) instead of the in-memory array.
- Implement protected routes on the backend (e.g., `/profile`) that:
  - Expect a JWT in an `Authorization: Bearer <token>` header.
  - Use a middleware to verify and decode the token.
- Update the frontend to:
  - Store the token securely for the session.
  - Include it in requests to protected endpoints.
- Integrate more advanced validation (e.g., password strength rules, unique constraints at DB level).
- Add logout UI and token clearing logic on the client side.

