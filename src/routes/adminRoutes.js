import express from "express";

import {
getAllBookings,
getAdminDashboard,
markLessonCompleted,
cancelBooking,
approveBooking
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

router.put("/approve/:bookingId", approveBooking);

router.put("/bookings/cancel/:bookingId", cancelBooking);

router.put("/bookings/complete/:bookingId", markLessonCompleted);


/*
==================================================
AVAILABILITY MANAGEMENT
==================================================
*/
router.post("/availability", createAvailability);

router.get("/availability", getAllAvailability);

router.delete("/availability/:availabilityId", deleteAvailability);


export default router;
