import Booking from "../models/Booking.js";
import User from "../models/User.js";

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
    const completedLessons = await Booking.countDocuments({ status: "completed" });
    const cancelledLessons = await Booking.countDocuments({ status: "cancelled" });
    const upcomingLessons = await Booking.countDocuments({ status: "booked" });

    res.status(200).json({
      success: true,
      dashboard: {
        totalStudents,
        totalBookings,
        completedLessons,
        cancelledLessons,
        upcomingLessons,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
==================================================
UPDATE BOOKING STATUS
==================================================
*/
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, instructorRemarks, paymentStatus, date, timeSlot } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (status) booking.status = status;
    if (instructorRemarks) booking.instructorRemarks = instructorRemarks;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (date) booking.date = date;
    if (timeSlot) booking.timeSlot = timeSlot;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};