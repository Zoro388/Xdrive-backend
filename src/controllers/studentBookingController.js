import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

/*
==================================================
BOOK SLOT
==================================================
*/
export const bookLesson = async (req, res) => {
  try {
    const { slotId } = req.body;

    // Validate slotId
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "slotId is required",
      });
    }

    // Find the availability slot
    const slot = await Availability.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    // Prevent double booking
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "This slot has already been booked",
      });
    }

    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = req.user._id;

    await slot.save();

    // Create booking record
    const booking = await Booking.create({
      student: req.user._id,
      slot: slot._id,
      status: "booked",
    });

    res.status(201).json({
      success: true,
      message: "Lesson booked successfully",
      data: {
        bookingId: booking._id,
        slotId: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });

  } catch (error) {
    console.error("Book lesson error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
========================================
CANCEL BOOKING
========================================
*/
export const cancelBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      student: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const slot = await Availability.findById(booking.slot);

    if (slot) {
      slot.isBooked = false;
      slot.bookedBy = null;
      await slot.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
========================================
GET UPCOMING BOOKINGS
========================================
*/
export const getUpcomingBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      student: req.user._id,
      status: "booked"
    })
      .populate("slot")
      .sort({ createdAt: 1 });

    res.json({ bookings });

  } catch (error) {
    console.error("Upcoming booking error:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
========================================
GET BOOKING HISTORY
========================================
*/
export const getBookingHistory = async (req, res) => {
  try {

    const bookings = await Booking.find({
      student: req.user._id,
      status: { $in: ["completed", "cancelled"] }
    })
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json({ bookings });

  } catch (error) {
    console.error("Booking history error:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
========================================
GET AVAILABLE SLOTS
========================================
*/
export const getAvailableSlots = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0,0,0,0);

    const slots = await Availability.find({
      isActive: true,
      isBooked: false,
      date: { $gte: today }
    }).sort({ date: 1 });

    res.json({ slots });

  } catch (error) {
    console.error("Available slots error:", error);
    res.status(500).json({ message: error.message });
  }
};