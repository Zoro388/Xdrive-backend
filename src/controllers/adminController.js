import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";

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
      status: "booked",
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
MARK LESSON COMPLETED
==================================================
*/
export const markLessonCompleted = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("student", "name email")
      .populate("slot");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "completed";

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


/*
==================================================
CANCEL BOOKING
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

    booking.status = "cancelled";

    // free the slot again
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


export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // expected: "completed" or "cancelled"

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Optional: check valid statuses
    const validStatuses = ["booked", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    booking.status = status;

    // If cancelling, free the slot
    if (status === "cancelled") {
      const slot = await Availability.findById(booking.slot);
      if (slot) {
        slot.isBooked = false;
        slot.bookedBy = null;
        await slot.save();
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};