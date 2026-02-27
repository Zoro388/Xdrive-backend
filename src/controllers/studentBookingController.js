import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

// 1️⃣ Get Booking History (completed or cancelled)
export const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      student: req.user._id,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ date: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ message: "No booking history found", bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Get Upcoming Bookings (future lessons)
export const getUpcomingBookings = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      student: req.user._id,
      status: "booked",
      date: { $gte: now },
    }).sort({ date: 1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ message: "No upcoming bookings found", bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ Cancel Booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      student: req.user._id,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4️⃣ Reschedule Booking
export const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newTimeSlot } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      student: req.user._id,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.date = newDate;
    booking.timeSlot = newTimeSlot;
    booking.status = "rescheduled";

    await booking.save();

    res.status(200).json({ message: "Booking rescheduled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5️⃣ Book a Lesson (new)
export const bookLesson = async (req, res) => {
  try {
    const { date, slotIndex, paymentStatus = "pending" } = req.body;

    // Find availability for the selected date
    const availability = await Availability.findOne({ date });
    if (!availability) {
      return res.status(404).json({ message: "No available slots for this date" });
    }

    // Validate slotIndex
    if (slotIndex < 0 || slotIndex >= availability.timeSlots.length) {
      return res.status(400).json({ message: "Invalid slot selected" });
    }

    const slot = availability.timeSlots[slotIndex];

    // Check if slot is already booked
    if (slot.isBooked) {
      return res.status(400).json({ message: "Selected slot is already booked" });
    }

    // Create booking
    const booking = await Booking.create({
      student: req.user._id,
      date,
      timeSlot: slot.slot,
      paymentStatus,
    });

    // Mark slot as booked
    slot.isBooked = true;
    await availability.save();

    res.status(201).json({ message: "Lesson booked successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};