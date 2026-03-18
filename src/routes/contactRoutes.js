import express from "express";
import {
  sendContactMessage,
  getContactMessages,
  markMessageRead,
} from "../controllers/contactController.js";

const router = express.Router();

// user sends message
router.post("/contact", sendContactMessage);

// admin fetches messages
router.get("/contact", getContactMessages);

// admin marks message as read
router.patch("/contact/:id/read", markMessageRead);

export default router;