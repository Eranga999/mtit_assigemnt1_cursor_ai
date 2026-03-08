import { Router } from "express";
import { register, login, healthCheck } from "../controllers/authController.js";

const router = Router();

router.get("/", healthCheck);
router.post("/register", register);
router.post("/login", login);

export default router;
