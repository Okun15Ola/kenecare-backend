const moment = require("moment");

const validateNewAppointmentDate = ({ date, time = null }) => {
  try {
    const submittedDate = moment(moment(date).format("YYYY-MM-DD"));
    const currentMoment = moment(moment().format("YYYY-MM-DD"));

    //check if the date is a valid date
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
    const submittedValue = moment(date, "YYYY-MM-DD", true);

    const currentMoment = moment("YYYY-MM-DD", true);

    const threeDaysLater = currentMoment.clone().add(3, "days");

    if (!submittedValue.isValid()) {
      throw new Error("Invalid Date format. Expected date format (YYYY-MM-DD)");
    }

    //check if the value is not an old date
    if (currentMoment.isAfter(submittedValue)) {
      throw new Error("Postpone Date must be a future date");
    }

    if (submittedValue.isAfter(threeDaysLater)) {
      throw new Error(
        "Postpone date must not be more than 3 days from today's date"
      );
    }

    return null;
  } catch (error) {
    console.log(error);
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
    console.log(error);
    throw error;
  }
};

module.exports = {
  validateNewAppointmentDate,
  validateAppointmentTime,
  validateAppointmentPostponedDate,
};
