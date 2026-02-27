import Availability from "../models/Availability.js";

/*
==================================================
CREATE AVAILABILITY (OPEN A DATE)
==================================================
*/
export const createAvailability = async (req, res) => {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Date and time slots are required",
      });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    if (normalizedDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "Cannot create availability for past dates",
      });
    }

    const existing = await Availability.findOne({ date: normalizedDate });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Availability already exists for this date",
      });
    }

    const availability = await Availability.create({
      date: normalizedDate,
      timeSlots,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
==================================================
GET ALL AVAILABILITY
==================================================
*/
export const getAllAvailability = async (req, res) => {
  try {
    const availability = await Availability.find().sort({ date: 1 });

    if (!availability.length) {
      return res.status(200).json({
        success: true,
        message: "No availability set yet",
        availability: [],
      });
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
==================================================
UPDATE AVAILABILITY (EDIT TIME SLOTS)
==================================================
*/
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const { timeSlots } = req.body;

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    availability.timeSlots = timeSlots;

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
==================================================
DELETE AVAILABILITY
==================================================
*/
export const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    await availability.deleteOne();

    res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};