import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

// 1️⃣ Get Booking History (completed or cancelled)
export const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      student: req.user._id,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ date: -1 });

    if (!bookings.length) {
      return res.status(200).json({ message: "No booking history found", bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get booking history error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Get Upcoming Bookings
export const getUpcomingBookings = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      student: req.user._id,
      status: "booked",
      date: { $gte: now },
    }).sort({ date: 1 });

    if (!bookings.length) {
      return res.status(200).json({ message: "No upcoming bookings found", bookings: [] });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get upcoming bookings error:", error);
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

    // Free the slot in availability
    const availability = await Availability.findOne({ date: booking.date, time: booking.timeSlot });
    if (availability) {
      availability.isBooked = false;
      await availability.save();
    }

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4️⃣ Update Booking (Reschedule)
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: "New date and time are required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, student: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if new slot exists and is available
    const newSlot = await Availability.findOne({ date: newDate, time: newTime });
    if (!newSlot) return res.status(404).json({ message: "Selected new slot not available" });
    if (newSlot.isBooked) return res.status(400).json({ message: "Selected new slot is already booked" });

    // Free old slot
    const oldSlot = await Availability.findOne({ date: booking.date, time: booking.timeSlot });
    if (oldSlot) {
      oldSlot.isBooked = false;
      await oldSlot.save();
    }

    // Update booking
    booking.date = newDate;
    booking.timeSlot = newTime;
    booking.status = "rescheduled";
    await booking.save();

    // Mark new slot as booked
    newSlot.isBooked = true;
    await newSlot.save();

    res.status(200).json({ message: "Booking updated successfully", booking });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5️⃣ Book a Lesson
export const bookLesson = async (req, res) => {
  try {
    const { date, time, paymentStatus = "pending" } = req.body;

    const slot = await Availability.findOne({ date, time });
    if (!slot) return res.status(404).json({ message: "Selected slot not available" });
    if (slot.isBooked) return res.status(400).json({ message: "This slot has already been booked" });

    const booking = await Booking.create({
      student: req.user._id,
      date,
      timeSlot: time,
      paymentStatus,
    });

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    res.status(201).json({ message: "Lesson booked successfully", booking });
  } catch (error) {
    console.error("Book lesson error:", error);
    res.status(500).json({ message: error.message });
  }
};