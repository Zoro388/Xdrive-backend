import express from "express";
import {
  getBookingHistory,
  getUpcomingBookings,
  cancelBooking,
  updateBooking, // ✅ matches controller
  bookLesson,
  getAvailableSlots
} from "../controllers/studentBookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes protected and only for students
router.use(protect);
router.use(authorizeRoles("student"));

// Get booking history
router.get("/history", getBookingHistory);

// Get upcoming bookings
router.get("/upcoming", getUpcomingBookings);

// Cancel booking
router.put("/cancel/:bookingId", cancelBooking);

// Update booking (reschedule)
router.put("/update/:bookingId", updateBooking);

// Book a lesson
router.post("/book", bookLesson);

// get available slots
router.get("/availability", protect, authorizeRoles("student"), getAvailableSlots);
export default router;