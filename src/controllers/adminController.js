import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import { sendApprovedBookingEmail } from "../services/emailService.js";

/*
==================================================
ADMIN DASHBOARD
Returns platform statistics
==================================================
*/
export const getAdminDashboard = async (req, res) => {
try {

const totalStudents = await User.countDocuments({ role: "student" });

const totalBookings = await Booking.countDocuments();

const completedLessons = await Booking.countDocuments({
status: "completed",
});

const cancelledLessons = await Booking.countDocuments({
status: "cancelled",
});

const upcomingLessons = await Booking.countDocuments({
status: { $in: ["pending", "approved"] },
});

const availableSlots = await Availability.countDocuments({
isBooked: false,
});

res.status(200).json({
success: true,
dashboard: {
totalStudents,
totalBookings,
completedLessons,
cancelledLessons,
upcomingLessons,
availableSlots,
},
});

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};


/*
==================================================
GET ALL BOOKINGS
==================================================
*/
export const getAllBookings = async (req, res) => {
try {

const bookings = await Booking.find()
.populate("student", "name email phone")
.populate("slot")
.sort({ createdAt: -1 });

res.status(200).json({
success: true,
count: bookings.length,
bookings,
});

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};


/*
==================================================
APPROVE BOOKING
==================================================
*/
export const approveBooking = async (req, res) => {
try {

const { bookingId } = req.params;

const booking = await Booking.findById(bookingId)
.populate("student", "name email")
.populate({
path: "slot",
populate: {
path: "instructor",
select: "name"
}
});

if (!booking) {
return res.status(404).json({
success: false,
message: "Booking not found",
});
}

if (booking.status === "approved") {
return res.status(400).json({
success: false,
message: "Booking already approved",
});
}

const slot = await Availability.findById(booking.slot._id);

if (!slot) {
return res.status(404).json({
success: false,
message: "Slot not found",
});
}

// update booking
booking.status = "approved";

// lock slot
slot.isBooked = true;
slot.bookedBy = booking.student._id;

await slot.save();
await booking.save();

console.log("Approval email to:", booking.student.email);
console.log("Instructor:", booking.slot.instructor?.name);

// send email
await sendApprovedBookingEmail(
booking.student.email,
booking.student.name,
slot.date,
`${slot.startTime} - ${slot.endTime}`,
booking.slot.instructor?.name || "Instructor"
);

res.status(200).json({
success: true,
message: "Booking approved and email sent",
booking,
});

} catch (error) {

console.error("Approve booking error:", error);

res.status(500).json({
success: false,
message: error.message,
});
}
};


/*
==================================================
CANCEL BOOKING (ADMIN)
==================================================
*/
export const cancelBooking = async (req, res) => {
try {

const { bookingId } = req.params;

const booking = await Booking.findById(bookingId);

if (!booking) {
return res.status(404).json({
success: false,
message: "Booking not found",
});
}

if (booking.status === "completed") {
return res.status(400).json({
success: false,
message: "Completed booking cannot be cancelled",
});
}

booking.status = "cancelled";

// free the slot
const slot = await Availability.findById(booking.slot);

if (slot) {
slot.isBooked = false;
slot.bookedBy = null;
await slot.save();
}

await booking.save();

res.status(200).json({
success: true,
message: "Booking cancelled successfully",
booking,
});

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};


/*
==================================================
MARK LESSON COMPLETED (ADMIN)
==================================================
*/
export const markLessonCompleted = async (req, res) => {
try {

const { bookingId } = req.params;

const booking = await Booking.findById(bookingId)
.populate("student", "name email phone")
.populate("slot");

if (!booking) {
return res.status(404).json({
success: false,
message: "Booking not found",
});
}

if (booking.status === "completed") {
return res.status(400).json({
success: false,
message: "Booking already completed",
});
}

booking.status = "completed";
booking.completed = true;

await booking.save();

res.status(200).json({
success: true,
message: "Lesson marked as completed",
booking,
});

} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};
