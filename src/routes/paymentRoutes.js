import express from "express";

import {
    createCheckoutSession,
    confirmPayment,
}from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/create-checkout", protect, createCheckoutSession)
router.post("/confirm-payment", protect, confirmPayment);


export default router;


