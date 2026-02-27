import express from "express";
import { getProfile, updateProfile } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// all routes are protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
