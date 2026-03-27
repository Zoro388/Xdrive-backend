import Availability from "../models/Availability.js";

/*
==================================================
CREATE AVAILABILITY
==================================================
*/
export const createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, price, hours, instructor } = req.body;

    if (!date || !startTime || !endTime || !price || !hours) {
      return res.status(400).json({
        message: "date, startTime, endTime, price and hours are required",
      });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    // Convert AM/PM time to minutes
    const convertToMinutes = (time) => {
      const [timePart, modifier] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    const existingSlots = await Availability.find({ date: parsedDate });

    for (let slot of existingSlots) {
      const slotStart = convertToMinutes(slot.startTime);
      const slotEnd = convertToMinutes(slot.endTime);

      if (slot.startTime === startTime && slot.endTime === endTime) {
        return res.status(400).json({
          success: false,
          message: "This exact time slot already exists for this date.",
        });
      }

      if (startMinutes < slotEnd && endMinutes > slotStart) {
        return res.status(400).json({
          success: false,
          message: `Time clash: ${startTime} - ${endTime} conflicts with existing slot ${slot.startTime} - ${slot.endTime}`,
        });
      }

      if (startMinutes === slotEnd || endMinutes === slotStart) {
        return res.status(400).json({
          success: false,
          message: "This time touches an existing slot. Please choose a different time range.",
        });
      }
    }

    const availability = await Availability.create({
      date: parsedDate,
      startTime,
      endTime,
      price,
      hours,
      instructor: instructor || null, // <-- safe fallback
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