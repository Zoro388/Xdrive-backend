import express from "express";
import {
  getAllBookings,
  updateBookingStatus,  // ✅ now exists
  getAdminDashboard,
  markLessonCompleted,
  cancelBooking
} from "../controllers/adminController.js";

import {
  createAvailability,
  getAllAvailability,
  deleteAvailability,
} from "../controllers/adminAvailabilityController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();


/*
==================================================
PROTECTED ADMIN ROUTES
==================================================
*/
router.use(protect);
router.use(authorizeRoles("admin"));

/*
==================================================
DASHBOARD
==================================================
*/
router.get("/dashboard", getAdminDashboard);

/*
==================================================
BOOKINGS MANAGEMENT
==================================================
*/
router.get("/bookings", getAllBookings);
router.put("/bookings/:bookingId", updateBookingStatus);

/*
==================================================
AVAILABILITY MANAGEMENT
==================================================
*/
router.post("/availability", createAvailability);        // Create availability
router.get("/availability", getAllAvailability);         // Get all availability
// router.put("/availability/:availabilityId", updateAvailability);  // Update
router.delete("/availability/:availabilityId", deleteAvailability); // Delete
router.put("/bookings/complete/:bookingId", markLessonCompleted);

router.put("/bookings/cancel/:bookingId", cancelBooking);

export default router;

