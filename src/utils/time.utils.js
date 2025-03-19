const moment = require("moment");

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
    console.log(error);
    throw error;
  }
};
const validateAppointmentPostponedDate = (date) => {
  try {
    const submittedDate = moment(moment(date).format("YYYY-MM-DD"));
    const currentMoment = moment(moment().format("YYYY-MM-DD"));
    const threeDaysLater = currentMoment.clone().add(3, "days");

    // check if the date is a valid date
    if (!submittedDate.isValid()) {
      throw new Error("Invalid Date format");
    }

    if (currentMoment.isAfter(submittedDate)) {
      throw new Error("Postpone date must be a future date.");
    }

    if (submittedDate.isAfter(threeDaysLater)) {
      throw new Error(
        "Postpone date must not be more than 3 days from today's date",
      );
    }

    return null;
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
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
  const today = moment().format("YYYY-MM-DD");
  const userDate = moment(date, "YYYY-MM-DD", true);

  if (!userDate.isValid()) {
    throw new Error("Appointment date must be a valid date (YYYY-MM-DD)");
  }

  if (userDate.isBefore(today)) {
    throw new Error(
      "Appointment date must be today or in the future. Please choose another date.",
    );
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

  // If the appointment is today, ensure it's at least 2 hours from the current time
  if (date === today) {
    const minAppointmentTime = now.add(1, "hours");
    if (userDateTime.isBefore(minAppointmentTime)) {
      throw new Error(
        "Appointments for today must be at least 1 hour from the current time.",
      );
    }
  }
};

module.exports = {
  validateNewAppointmentDate,
  validateAppointmentTime,
  validateAppointmentPostponedDate,
  refineMobileNumber,
  validateDate,
  validateDateTime,
};
