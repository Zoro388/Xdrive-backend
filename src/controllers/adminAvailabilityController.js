import Availability from "../models/Availability.js";

/*
==================================================
CREATE WEEKLY AVAILABILITY
==================================================
*/
export const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, maxBookings } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      !maxBookings
    ) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek, startTime, endTime and maxBookings are required",
      });
    }

    // Check if same slot already exists
    const existing = await Availability.findOne({
      dayOfWeek,
      startTime,
      endTime,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Availability already exists for this time range",
      });
    }

    const availability = await Availability.create({
      dayOfWeek,
      startTime,
      endTime,
      maxBookings,
      bookings: [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    console.error("Create availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
GET ALL AVAILABILITY
==================================================
*/
export const getAllAvailability = async (req, res) => {
  try {
    const availability = await Availability.find().sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
UPDATE AVAILABILITY
==================================================
*/
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const { startTime, endTime, maxBookings, isActive } = req.body;

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (maxBookings) availability.maxBookings = maxBookings;
    if (isActive !== undefined) availability.isActive = isActive;

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error("Delete availability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};