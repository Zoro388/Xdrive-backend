import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

/*
========================================
GET AVAILABLE SLOTS
========================================
*/
export const getAvailableSlots = async (req, res) => {
try {

const slots = await Availability.find({
isBooked: false,
isActive: true
}).populate("instructor", "name email");

res.status(200).json({
success: true,
count: slots.length,
slots
});

} catch (error) {

res.status(500).json({
success: false,
message: error.message
});
}
};


/*
========================================
BOOK LESSON
========================================
*/



export const bookLesson = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ success: false, message: "slotId is required" });
    }

    const slot = await Availability.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: "Slot already booked" });
    }

    const existingBooking = await Booking.findOne({
      student: req.user._id,
      slot: slotId,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: "You already booked this slot" });
    }

    const booking = await Booking.create({
      student: req.user._id,
      instructor: slot.instructor || null, // <- safe fallback
      slot: slot._id,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Booking created and waiting for admin approval",
      booking
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const bookLesson = async (req, res) => {
// try {

// const { slotId } = req.body;

// if (!slotId) {
// return res.status(400).json({
// success: false,
// message: "slotId is required"
// });
// }

// const slot = await Availability.findById(slotId);

// if (!slot) {
// return res.status(404).json({
// success: false,
// message: "Slot not found"
// });
// }

// if (slot.isBooked) {
// return res.status(400).json({
// success: false,
// message: "Slot already booked"
// });
// }

// const existingBooking = await Booking.findOne({
// student: req.user._id,
// slot: slotId,
// status: { $in: ["pending", "approved"] }
// });

// if (existingBooking) {
// return res.status(400).json({
// success: false,
// message: "You already booked this slot"
// });
// }

// const booking = await Booking.create({
// student: req.user._id,
// instructor: slot.instructor,
// slot: slot._id,
// status: "pending"
// });

// res.status(201).json({
// success: true,
// message: "Booking created and waiting for admin approval",
// booking
// });

// } catch (error) {

// console.error(error);

// res.status(500).json({
// success: false,
// message: error.message
// });
// }
// };


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
.populate("slot")
.populate("instructor", "name email")
.sort({ createdAt: -1 });

res.status(200).json({
success: true,
count: bookings.length,
bookings
});

} catch (error) {

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
.populate("slot")
.populate("instructor", "name email")
.sort({ createdAt: -1 });

res.status(200).json({
success: true,
count: history.length,
history
});

} catch (error) {

res.status(500).json({
success: false,
message: error.message
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

const booking = await Booking.findById(bookingId);

if (!booking) {
return res.status(404).json({
success: false,
message: "Booking not found"
});
}

if (booking.student.toString() !== req.user._id.toString()) {
return res.status(403).json({
success: false,
message: "Unauthorized"
});
}

if (booking.status !== "pending") {
return res.status(400).json({
success: false,
message: "Only pending bookings can be cancelled"
});
}

booking.status = "cancelled";

await booking.save();

res.status(200).json({
success: true,
message: "Booking cancelled successfully",
booking
});

} catch (error) {

res.status(500).json({
success: false,
message: error.message
});
}
};
