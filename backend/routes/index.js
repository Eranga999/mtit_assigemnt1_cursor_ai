import { Router } from "express";
import authRoutes from "./authRoutes.js";

const router = Router();

// Auth-related routes (/, /register, /login)
router.use("/", authRoutes);

export default router;

