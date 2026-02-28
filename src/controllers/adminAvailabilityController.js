import Availability from "../models/Availability.js";
import moment from "moment";

/*
==================================================
CREATE AVAILABILITY
==================================================
*/
export const createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, maxBookings } = req.body;

    if (!date || !startTime || !endTime || !maxBookings) {
      return res.status(400).json({
        success: false,
        message: "date, startTime, endTime and maxBookings are required",
      });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    // Check if same slot already exists
    const existing = await Availability.findOne({
      date: parsedDate,
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
      date: parsedDate,
      startTime,
      endTime,
      maxBookings,
      bookings: [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      availability: {
        ...availability.toObject(),
        date: moment(availability.date).format("MM/DD/YYYY"),
      },
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
    const availability = await Availability.find().sort({ date: 1 });

    const formattedAvailability = availability.map((a) => ({
      _id: a._id,
      date: moment(a.date).format("MM/DD/YYYY"), // calendar format
      startTime: a.startTime,
      endTime: a.endTime,
      maxBookings: a.maxBookings,
      bookings: a.bookings,
      isActive: a.isActive,
    }));

    res.status(200).json({
      success: true,
      availability: formattedAvailability,
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
    const { date, startTime, endTime, maxBookings, isActive } = req.body;

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    if (date) availability.date = new Date(date);
    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (maxBookings) availability.maxBookings = maxBookings;
    if (isActive !== undefined) availability.isActive = isActive;

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability: {
        ...availability.toObject(),
        date: moment(availability.date).format("MM/DD/YYYY"),
      },
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