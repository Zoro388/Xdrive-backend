import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
});

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true, // prevent duplicate dates
    },
    timeSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;