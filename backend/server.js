import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";

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

// Global middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Register routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});

