const moment = require("moment");
const logger = require("../middlewares/logger.middleware");
const {
  getAvailableDoctors,
} = require("../repository/doctorAvailableDays.repository");
const {
  DELETE_SLOTS,
  BULK_INSERT_DOCTOR_TIME_SLOTS,
} = require("../repository/queries/doctorTimeSlot.queries");
const { withTransaction } = require("../repository/db.connection");

const SL_COUNTRY_CODE = "+232";

const validateNewAppointmentDate = ({ date }) => {
  try {
    const submittedDate = moment(moment(date).format("YYYY-MM-DD"));
    const currentMoment = moment(moment().format("YYYY-MM-DD"));

    // check if the date is a valid date
    if (!submittedDate.isValid()) {
      throw new Error("Invalid Date format");
    }

    if (currentMoment.isAfter(submittedDate)) {
      throw new Error("New date must be a future date.");
    }

    return null;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const validateAppointmentPostponedDate = (date, originalAppointmentDate) => {
  try {
    const submittedDate = moment(date, "YYYY-MM-DD", true);
    const originalDate = moment(originalAppointmentDate, "YYYY-MM-DD", true);

    // Check if the date is a valid date
    if (!submittedDate.isValid()) {
      return "Invalid date format. Expected YYYY-MM-DD.";
    }

    // Postponed date must be after the original appointment date
    if (!submittedDate.isAfter(originalDate)) {
      return "Postpone date must be after the original appointment date.";
    }

    // Postponed date must not be more than 3 days from the original appointment date
    const threeDaysLater = originalDate.clone().add(3, "days");
    if (submittedDate.isAfter(threeDaysLater)) {
      return "Postpone date must not be more than 3 days from the original appointment date.";
    }

    return null;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};
const validateAppointmentTime = (time) => {
  try {
    const startTime = moment("08:00", "HH:mm");
    const endTime = moment("18:00", "HH:mm");

    const submittedTime = moment(time, "HH:mm");

    // Check if the new time is between 09:00 and 17:00
    if (submittedTime.isBefore(startTime) || submittedTime.isAfter(endTime)) {
      return new Error("Appointment time must be between 08:00 and 18:00.");
    }

    return null;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
};

const refineMobileNumber = (mobileNumber) => {
  if (!mobileNumber) return null;
  const slicedMobileNumber = mobileNumber.slice(-8);
  return `${SL_COUNTRY_CODE}${slicedMobileNumber}`;
};

/**
 * Validates an appointment date.
 * Ensures the date is in 'YYYY-MM-DD' format and is not in the past.
 *
 * @param {string} date - The appointment date (YYYY-MM-DD).
 * @throws {Error} If the date is invalid or in the past.
 */
const validateDate = (date) => {
  // const today = moment().format("YYYY-MM-DD");
  const today = moment().startOf("day"); // Keep as a Moment object
  const userDate = moment(date, "YYYY-MM-DD", true);

  if (!userDate.isValid()) {
    throw new Error(
      "Appointment date must be a valid date format (YYYY-MM-DD)",
    );
  }

  if (userDate.isBefore(today)) {
    throw new Error(
      "Appointment date must be today or in the future. Please choose another date.",
    );
  }

  const oneMonthLater = today.clone().add(1, "month");
  if (userDate.isAfter(oneMonthLater)) {
    throw new Error("Appointment date cannot be more than a month from today.");
  }
};

/**
 * Validates an appointment date and time.
 * Ensures the date is in 'YYYY-MM-DD' format and is not in the past.
 * If the date is today, it checks whether the selected time is still in the future.
 *
 * @param {string} date - The appointment date (YYYY-MM-DD).
 * @param {string} time - The appointment time (HH:mm).
 * @throws {Error} If the date/time is invalid or in the past.
 */
const validateDateTime = ({ date, time }) => {
  const now = moment();
  const userDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm", true);
  const today = moment().format("YYYY-MM-DD");
  if (!userDateTime.isValid()) {
    throw new Error(
      "Appointment date and time must be valid (YYYY-MM-DD HH:mm)",
    );
  }

  if (userDateTime.isBefore(now)) {
    throw new Error(
      "Appointment time must be in the future. Please choose another time.",
    );
  }

  // If the appointment is today, ensure it's at least 1 hours from the current time
  if (date === today) {
    const minAppointmentTime = now.add(1, "hours");
    if (userDateTime.isBefore(minAppointmentTime)) {
      throw new Error(
        "Appointments for today must be at least 1 hour from the current time.",
      );
    }
  }
};

/**
 * Generates a token expiry time by adding the specified number of minutes to the current time.
 *
 * @param {number} value - The number of minutes to add to the current time.
 * @returns {Date} The resulting expiry time as a JavaScript Date object.
 */
const generateTokenExpiryTime = (value) => {
  return moment().add(value, "minutes").toDate();
};

/**
 * Checks if the current date and time is after the provided date value, indicating token expiry.
 *
 * @param {string|Date} value - The date or date string to compare against the current time.
 * @returns {boolean} Returns true if the current date is after the provided value (token is expired), otherwise false.
 */
const verifyTokenExpiry = (value) => {
  return new Date() > new Date(value);
};

const normalizeAndValidateTime = (value) => {
  const normalizedTime = value.trim();
  const timeFormats = ["HH:mm:ss", "H:mm:ss", "HH:mm", "H:mm"];
  const timeMoment = moment(normalizedTime, timeFormats, true);
  if (!timeMoment.isValid()) {
    throw new Error(
      "Invalid time format. Expected formats: HH:MM:SS, H:MM:SS, HH:MM, or H:MM",
    );
  }
  return timeMoment.format("HH:mm:ss");
};

const validateTimeFormat = (value) => {
  if (!value) {
    return true;
  }
  normalizeAndValidateTime(value);
  return true;
};

const validateTimeRange = (startTime, endTime) => {
  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");
  if (!start.isValid() || !end.isValid()) {
    throw new Error("Invalid time format");
  }
  if (start.isSameOrAfter(end)) {
    throw new Error("Start time must be before end time");
  }

  return true;
};

/**
 * Generates time slots for all doctors based on their available days with breaks between slots
 * @returns {Promise<{success: boolean, message: string, count?: number}>}
 */
const generateDoctorTimeSlots = async () => {
  try {
    // Get all doctors with their available days
    const availableDays = await getAvailableDoctors();

    if (!availableDays?.length) {
      return { success: true, message: "No available days found" };
    }

    const slotValues = [];

    availableDays.forEach((day) => {
      const { daySlotId, doctorId, dayStartTime, dayEndTime } = {
        daySlotId: day.daySlotId,
        day: day.day,
        doctorId: day.doctorId,
        dayStartTime: day.dayStartTime,
        dayEndTime: day.dayEndTime,
      };

      if (!dayStartTime || !dayEndTime) {
        return;
      }

      // Generate slots with breaks for this day
      const startTime = moment(dayStartTime, "HH:mm:ss");
      const endTime = moment(dayEndTime, "HH:mm:ss");
      let currentTime = startTime.clone();

      while (currentTime.clone().add(30, "minutes").isSameOrBefore(endTime)) {
        // Create a 30-minute slot
        const slotEndTime = currentTime.clone().add(30, "minutes");

        slotValues.push([
          doctorId,
          daySlotId,
          currentTime.format("HH:mm:ss"),
          slotEndTime.format("HH:mm:ss"),
          1, // is_slot_available
        ]);

        // Add a 10-minute break after the slot
        currentTime = slotEndTime.clone().add(10, "minutes");
      }
    });

    if (slotValues.length === 0) {
      return { success: true, message: "No slots to generate" };
    }

    // Clear existing slots for the upcoming week before inserting new ones
    const result = await withTransaction(async (connection) => {
      await connection.query(DELETE_SLOTS);

      // Insert all generated slots
      const [insertResult] = await connection.query(
        BULK_INSERT_DOCTOR_TIME_SLOTS,
        [slotValues],
      );

      return insertResult;
    });

    return {
      success: true,
      message: `Successfully generated ${result.affectedRows} time slots with breaks`,
      count: result.affectedRows,
    };
  } catch (error) {
    console.error("❌ ERROR generating time slots:", error);
    logger.error("Error generating time slots:", error);
    return { success: false, message: "Error generating time slots" };
  }
};

module.exports = {
  validateNewAppointmentDate,
  validateAppointmentTime,
  validateAppointmentPostponedDate,
  refineMobileNumber,
  validateDate,
  validateDateTime,
  generateTokenExpiryTime,
  verifyTokenExpiry,
  normalizeAndValidateTime,
  validateTimeFormat,
  validateTimeRange,
  generateDoctorTimeSlots,
};
