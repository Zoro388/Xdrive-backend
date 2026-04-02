import express from "express";

import {
    createCheckoutSession,
    confirmPayment,
    confirmCashPayment,
}from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js"
const router = express.Router();
router.post("/create-checkout", protect, createCheckoutSession)
router.post("/confirm-payment", protect, confirmPayment);
router.put("/confirm-cash/:bookingId", protect, authorizeRoles("admin"), confirmCashPayment);


export default router;