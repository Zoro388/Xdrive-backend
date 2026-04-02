import stripe from "../utils/stripe.js";
import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";

/*
===========================================
CREATE PAYMENT / BOOKING
===========================================
*/

export const createCheckoutSession = async (req, res) => {
  try {
    const { slotId, paymentMethod } = req.body;

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

    /*
    ===========================================
    CASH PAYMENT FLOW
    ===========================================
    */
    if (paymentMethod === "cash") {
      const booking = await Booking.create({
        student: req.user._id,
        slot: slotId,
        paymentMethod: "cash",
        paymentStatus: "pending",
        status: "booked",
      });

      slot.isBooked = true;
      slot.bookedBy = req.user._id;
      await slot.save();

      return res.status(200).json({
        message: "Booking created successfully (cash)",
        booking,
      });
    }

    /*
    ===========================================
    STRIPE PAYMENT FLOW
    ===========================================
    */
    if (paymentMethod === "stripe") {
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

        metadata: {
          slotId: slot._id.toString(),
          userId: req.user._id.toString(),
        },

        success_url: `${process.env.FRONTEND_URL}/payment-success?slotId=${slot._id}&userId=${req.user._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      });

      return res.status(200).json({
        url: session.url,
      });
    }

    /*
    ===========================================
    INVALID METHOD
    ===========================================
    */
    return res.status(400).json({
      message: "Invalid payment method",
    });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: error.message });
  }
};


/*
===========================================
CONFIRM STRIPE PAYMENT
===========================================
*/

export const confirmPayment = async (req, res) => {
  try {
    const { slotId, userId } = req.body;

    const slot = await Availability.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const booking = await Booking.create({
      student: userId,
      slot: slotId,
      paymentMethod: "stripe",
      paymentStatus: "paid",
      status: "booked",
    });

    slot.isBooked = true;
    slot.bookedBy = userId;

    await slot.save();

    res.status(200).json({
      message: "Payment successful, booking created",
      booking,
    });

  } catch (error) {
    console.error("Confirm error:", error);
    res.status(500).json({ message: error.message });
  }
};



// import Booking from "../models/Booking.js";

/*
==================================================
CONFIRM CASH PAYMENT
==================================================
*/
export const confirmCashPayment = async (req, res) => {
try {

const { bookingId } = req.params;

const booking = await Booking.findById(bookingId);

if (!booking) {
return res.status(404).json({
success: false,
message: "Booking not found",
});
}

if (booking.paymentStatus === "paid") {
return res.status(400).json({
success: false,
message: "Payment already confirmed",
});
}

booking.paymentStatus = "paid";
booking.paymentMethod = "cash";

await booking.save();

res.status(200).json({
success: true,
message: "Cash payment confirmed successfully",
booking,
});

} catch (error) {

console.error("Cash payment error:", error);

res.status(500).json({
success: false,
message: error.message,
});
}
};
