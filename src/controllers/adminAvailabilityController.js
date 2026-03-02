import Availability from "../models/Availability.js";

/*
==================================================
CREATE AVAILABILITY
==================================================
*/
export const createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, price, hours } = req.body;

    if (!date || !startTime || !endTime || !price || !hours) {
      return res.status(400).json({
        success: false,
        message: "date, startTime, endTime, price and hours are required",
      });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const existing = await Availability.findOne({
      date: parsedDate,
      startTime,
      endTime,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This slot already exists",
      });
    }

    const availability = await Availability.create({
      date: parsedDate,
      startTime,
      endTime,
      price,
      hours,
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
    const availability = await Availability.find()
      .populate("bookedBy", "name email")
      .sort({ date: 1 });

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
UPDATE AVAILABILITY
==================================================
*/
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const { date, startTime, endTime, price, hours, isActive } = req.body;

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
    if (price) availability.price = price;
    if (hours) availability.hours = hours;
    if (isActive !== undefined) availability.isActive = isActive;

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