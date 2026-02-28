import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g., "09:00 AM"
      required: true,
    },
    hours: {
      type: Number, // duration in hours
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false, // marks if the slot has been booked
    },
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;