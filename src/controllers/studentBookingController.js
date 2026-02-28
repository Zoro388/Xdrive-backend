import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

// Helper: get next date for a day of the week
const nextDateForDay = (dayOfWeek) => {
  const today = new Date();
  const resultDate = new Date(today);
  resultDate.setDate(today.getDate() + ((7 + dayOfWeek - today.getDay()) % 7));
  resultDate.setHours(0, 0, 0, 0);
  return resultDate;
};

// =======================
// Book a Lesson
// =======================
export const bookLesson = async (req, res) => {
  try {
    const { dayOfWeek, timeSlot, paymentStatus = "pending" } = req.body;

    if (dayOfWeek === undefined || !timeSlot) {
      return res.status(400).json({ message: "dayOfWeek and timeSlot are required" });
    }

    const slot = await Availability.findOne({
      dayOfWeek,
      startTime: { $lte: timeSlot },
      endTime: { $gte: timeSlot },
      isActive: true,
    });

    if (!slot) return res.status(404).json({ message: "No available slot for this time" });
    if (slot.bookings.length >= slot.maxBookings)
      return res.status(400).json({ message: "This slot is fully booked" });

    const booking = await Booking.create({
      student: req.user._id,
      date: nextDateForDay(dayOfWeek),
      timeSlot,
      paymentStatus,
    });

    slot.bookings.push(booking._id);
    await slot.save();

    res.status(201).json({ message: "Lesson booked successfully", booking });
  } catch (error) {
    console.error("Book lesson error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Cancel Booking
// =======================
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ _id: bookingId, student: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Remove booking from availability
    const slot = await Availability.findOne({
      dayOfWeek: booking.date.getDay(),
      startTime: { $lte: booking.timeSlot },
      endTime: { $gte: booking.timeSlot },
    });

    if (slot) {
      slot.bookings = slot.bookings.filter((b) => b.toString() !== booking._id.toString());
      await slot.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Reschedule Booking
// =======================
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDayOfWeek, newTimeSlot } = req.body;

    if (newDayOfWeek === undefined || !newTimeSlot) {
      return res.status(400).json({ message: "New dayOfWeek and timeSlot are required" });
    }

    const booking = await Booking.findOne({ _id: bookingId, student: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const oldSlot = await Availability.findOne({
      dayOfWeek: booking.date.getDay(),
      startTime: { $lte: booking.timeSlot },
      endTime: { $gte: booking.timeSlot },
    });

    if (oldSlot) {
      oldSlot.bookings = oldSlot.bookings.filter((b) => b.toString() !== booking._id.toString());
      await oldSlot.save();
    }

    const newSlot = await Availability.findOne({
      dayOfWeek: newDayOfWeek,
      startTime: { $lte: newTimeSlot },
      endTime: { $gte: newTimeSlot },
      isActive: true,
    });

    if (!newSlot) return res.status(404).json({ message: "New slot not available" });
    if (newSlot.bookings.length >= newSlot.maxBookings)
      return res.status(400).json({ message: "New slot is fully booked" });

    booking.date = nextDateForDay(newDayOfWeek);
    booking.timeSlot = newTimeSlot;
    booking.status = "rescheduled";
    await booking.save();

    newSlot.bookings.push(booking._id);
    await newSlot.save();

    res.status(200).json({ message: "Booking rescheduled successfully", booking });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Get Upcoming Bookings
// =======================
export const getUpcomingBookings = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      student: req.user._id,
      status: "booked",
      date: { $gte: now },
    }).sort({ date: 1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get upcoming bookings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =======================
// Get Booking History
// =======================
export const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({
      student: req.user._id,
      status: { $in: ["completed", "cancelled"] },
    }).sort({ date: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get booking history error:", error);
    res.status(500).json({ message: error.message });
  }
};