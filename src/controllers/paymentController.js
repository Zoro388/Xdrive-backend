import stripe from "../utils/stripe.js";
import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

/*
===========================================
CREATE CHECKOUT SESSION
===========================================
*/

export const createCheckoutSession = async (req, res) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId is required" });
    }

    const slot = await Availability.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // Create booking first
    const booking = await Booking.create({
      student: req.user._id,
      slot: slot._id,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "gbp",

            product_data: {
              name: "Driving Lesson",
              description: `${slot.startTime} - ${slot.endTime}`,
            },

            unit_amount: slot.price * 100,
          },

          quantity: 1,
        },
      ],

      mode: "payment",

      success_url: `${process.env.CLIENT_URL}/payment-success?bookingId=${booking._id}`,

      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
===========================================
VERIFY PAYMENT
===========================================
*/

export const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.status = "booked";

    await booking.save();

    const slot = await Availability.findById(booking.slot);

    slot.isBooked = true;
    slot.bookedBy = booking.student;

    await slot.save();

    res.status(200).json({
      message: "Payment confirmed",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







