import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Fail fast if the JWT secret is missing to avoid issuing weak tokens.
if (!JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not set. Define it in a .env file before starting the server."
  );
  process.exit(1);
}

// In-memory user "storage" for demo purposes only
// In real applications, use a database.
const users = [];

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Validate registration or login payload.
 * This does basic checks; more advanced validation can be added as needed.
 */
function validateAuthPayload({ email, password, username }, { requireUsername = false } = {}) {
  const errors = [];

  // Email validation with length check
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  } else {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 254) {
      errors.push("Email must be 254 characters or less.");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.push("Email format is invalid.");
      }
    }
  }

  // Password validation with length checks
  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.");
  } else {
    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    } else if (trimmedPassword.length > 128) {
      errors.push("Password must be 128 characters or less.");
    }
  }

  // Username validation with length checks
  if (requireUsername) {
    if (!username || typeof username !== "string" || !username.trim()) {
      errors.push("Username is required.");
    } else {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        errors.push("Username must be at least 3 characters long.");
      } else if (trimmedUsername.length > 30) {
        errors.push("Username must be 30 characters or less.");
      }
    }
  }

  return errors;
}

/**
 * POST /register
 * Registers a new user with username, email, and password.
 */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validationErrors = validateAuthPayload(
      { email, password, username },
      { requireUsername: true }
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationErrors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    // Check for duplicate email and username separately for better error messages
    const existingEmail = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    const existingUsername = users.find(
      (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
    );

    if (existingEmail && existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Both username and email are already taken.",
      });
    } else if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    } else if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Error in /register:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
});

/**
 * POST /login
 * Logs a user in with email and password and returns a JWT.
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationErrors = validateAuthPayload({ email, password });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationErrors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Error in /login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
});

// Health check / simple root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Auth API is running.",
  });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});

