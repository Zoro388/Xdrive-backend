import express from "express";

import {
getBookingHistory,
getUpcomingBookings,
cancelBooking,
bookLesson,
getAvailableSlots
} from "../controllers/studentBookingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
========================================
PROTECTED STUDENT ROUTES
========================================
*/

router.use(protect);
router.use(authorizeRoles("student"));

/*
========================================
AVAILABLE SLOTS
========================================
*/
router.get("/availability", getAvailableSlots);

/*
========================================
BOOK LESSON
========================================
*/
router.post("/book", bookLesson);

/*
========================================
UPCOMING BOOKINGS
========================================
*/
router.get("/upcoming", getUpcomingBookings);

/*
========================================
BOOKING HISTORY
========================================
*/
router.get("/history", getBookingHistory);

/*
========================================
CANCEL BOOKING
========================================
*/
router.put("/cancel/:bookingId", cancelBooking);

export default router;
