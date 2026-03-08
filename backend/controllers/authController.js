import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateAuthPayload } from "../utils/validate.js";

// In-memory user "storage" for demo purposes only.
// In real applications, replace this with a database.
const users = [];

// Read at request time so dotenv has already run (ESM loads controller before server.js body).
function getJwtSecret() {
  return process.env.JWT_SECRET;
}

export async function register(req, res) {
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
    console.error("Error in register:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

export async function login(req, res) {
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

    const secret = getJwtSecret();
    if (!secret) {
      console.error("JWT_SECRET is not set.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      secret,
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
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

export function healthCheck(req, res) {
  return res.json({
    message: "Auth API is running.",
  });
}

