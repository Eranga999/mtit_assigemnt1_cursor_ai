## Overview

This project is a minimal full-stack authentication example for learning purposes.  
The **backend** is built with Node.js, Express, bcrypt, and JWT; the **frontend** uses HTML, CSS, and vanilla JavaScript.

## Project Structure

- `backend/` – Node.js + Express API
  - `server.js` – main server file with `/register` and `/login` endpoints
  - `.env.example` – example environment variables
  - `package.json` – Node project metadata
- `frontend/` – static frontend
  - `index.html` – login/registration UI
  - `styles.css` – styling
  - `app.js` – frontend logic and API calls

## Backend Setup

1. **Install Node.js** (if you do not have it already) from the official website.

2. **Install backend dependencies**:

   ```bash
   cd backend
   npm install express bcrypt jsonwebtoken dotenv cors
   ```

   This will also update `package.json` with the required dependencies.

3. **Create a `.env` file** in the `backend` folder based on `.env.example`:

   ```bash
   cd backend
   copy .env.example .env   # On Windows PowerShell: Copy-Item .env.example .env
   ```

   Then edit `.env` and set:

   - `JWT_SECRET` – a long, random secret string (do **not** share this)
   - `PORT` – optional (defaults to `5000`)

4. **Run the backend server**:

   ```bash
   cd backend
   npm start
   ```

   The API will be available at `http://localhost:5000`.

## API Endpoints

- **POST `/register`**
  - Body (JSON): `{ "username": "john", "email": "john@example.com", "password": "password123" }`
  - Validates:
    - Non-empty fields
    - Basic email format
    - Minimum password length (8+)
    - Duplicate username or email (in-memory check)
  - Response:
    - `201 Created` on success
    - `400`, `409`, or `500` with JSON error message on failure

- **POST `/login`**
  - Body (JSON): `{ "email": "john@example.com", "password": "password123" }`
  - Validates input and credentials, then issues a JWT.
  - Response:
    - `200 OK` with `{ token: "<JWT>" }` on success
    - `400`, `401`, or `500` with JSON error message on failure

## Frontend Usage

1. **Start the backend** as described above so that `http://localhost:5000` is available.

2. **Open the frontend**:

   - Option 1: Double-click `frontend/index.html` to open it in your browser.
   - Option 2: Use a simple static server or VS Code Live Server extension and serve the `frontend` folder.

3. **Using the UI**:

   - Switch between **Login** and **Register** tabs without reloading the page.
   - Forms perform basic client-side validation (required fields, email format, password length).
   - Submit buttons are **disabled while a request is in progress**.
   - Clear **success and error messages** are displayed for API responses.
   - After a **successful login**, the returned **JWT token** is displayed in the UI.

## Security Notes (Learning Context)

- Passwords are **hashed with bcrypt** before being stored in the in-memory array.
- JWTs are signed with a secret loaded from **environment variables**.
- This project **does not use a database** and **does not persist users**, which is fine for demos but **not for production**.
- For real-world applications, you should:
  - Store users in a secure database.
  - Use HTTPS.
  - Use secure cookie or header practices for JWTs.
  - Add rate limiting, logging, and more advanced validation.

