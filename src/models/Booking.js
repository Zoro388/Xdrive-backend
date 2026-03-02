import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending"],
      default: "pending",
    },
    instructorRemarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);