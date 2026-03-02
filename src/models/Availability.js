import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "09:00 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g., "10:00 AM"
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    hours: {
      type: Number, // duration in hours
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);