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

if (!slotId) {
return res.status(400).json({
success: false,
message: "slotId is required",
});
}

const slot = await Availability.findById(slotId)
.populate("instructor");

if (!slot) {
return res.status(404).json({
success: false,
message: "Slot not found",
});
}

if (slot.isBooked) {
return res.status(400).json({
success: false,
message: "This slot has already been booked",
});
}

const existingBooking = await Booking.findOne({
student: req.user._id,
slot: slotId
});

if (existingBooking) {
return res.status(400).json({
success: false,
message: "You already booked this slot",
});
}

const booking = await Booking.create({
student: req.user._id,
slot: slot._id,
status: "pending",
});

res.status(201).json({
success: true,
message: "Booking created and waiting for admin approval",
data: booking
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
status: { $in: ["pending", "approved"] }
})
.populate({
path: "slot",
select: "date startTime endTime price",
populate: {
path: "instructor",
select: "name email"
}
})
.sort({ createdAt: -1 });

res.status(200).json({
success: true,
count: bookings.length,
bookings
});

} catch (error) {
console.error("Upcoming booking error:", error);
res.status(500).json({
success: false,
message: error.message
});
}
};



/*
========================================
GET BOOKING HISTORY
========================================
*/
export const getBookingHistory = async (req, res) => {
try {

const history = await Booking.find({
student: req.user._id,
status: { $in: ["completed", "cancelled"] }
})
.populate({
path: "slot",
select: "date startTime endTime price",
populate: {
path: "instructor",
select: "name email"
}
})
.sort({ createdAt: -1 });

res.status(200).json({
success: true,
count: history.length,
history
});

} catch (error) {
console.error("Booking history error:", error);
res.status(500).json({
success: false,
message: error.message
});
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