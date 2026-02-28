import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// ========================
// Existing auth routes
// ========================
router.post("/register", register);
router.post("/login", login);

// ========================
// New password reset routes
// ========================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;