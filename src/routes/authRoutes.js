import express from "express";
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  authStatus,
  logoutUser
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
========================
AUTH ROUTES
========================
*/
router.post("/register", register);
router.post("/login", login);

/*
========================
PASSWORD RESET ROUTES
========================
*/
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/*
========================
AUTH STATUS ROUTE
========================
*/
router.get("/status", protect, authStatus);


// Logout
router.post("/logout", protect, logoutUser);

export default router;