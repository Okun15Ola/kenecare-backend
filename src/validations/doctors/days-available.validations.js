const { body, param } = require("express-validator");
const moment = require("moment");
const db = require("../../repository/doctorAvailableDays.repository");
const { getDoctorByUserId } = require("../../repository/doctors.repository");

// Helper function to validate time format and parse with moment
const normalizeAndValidateTime = (value) => {
  const normalizedTime = value.trim();

  // Try to parse with multiple formats using moment.js
  const timeFormats = ["HH:mm:ss", "H:mm:ss", "HH:mm", "H:mm"];
  const timeMoment = moment(normalizedTime, timeFormats, true);

  if (!timeMoment.isValid()) {
    throw new Error(
      "Invalid time format. Expected formats: HH:MM:SS, H:MM:SS, HH:MM, or H:MM",
    );
  }
  // Format to standard HH:mm:ss format
  return timeMoment.format("HH:mm:ss");
};

const validateTimeFormat = (value) => {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  normalizeAndValidateTime(value);
  return true;
};

// Helper function to validate time range
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

exports.dayOfWeekParamValidation = [
  param("day")
    .notEmpty()
    .withMessage("Day is required")
    .bail()
    .toLowerCase()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Day must be a valid day (monday-sunday)")
    .bail()
    .trim()
    .escape(),
];

exports.singleDayAvailabilityValidations = [
  body("day")
    .notEmpty()
    .withMessage("Day is required")
    .bail()
    .toLowerCase()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Day must be a valid day (monday-sunday)")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const { id } = req.user;
      const { doctor_id: doctorId } = await getDoctorByUserId(id);
      if (!doctorId) {
        throw new Error("Doctor Not Found");
      }
      const existingDay = await db.getSpecificDayAvailability(doctorId, value);
      if (existingDay) {
        throw new Error(
          `Availability for "${value}" already exists, please update it.`,
        );
      }
      return true;
    }),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .bail()
    .custom(validateTimeFormat)
    .withMessage("Start time must be in HH:MM:SS format"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .bail()
    .custom(validateTimeFormat)
    .withMessage("End time must be in HH:MM:SS format"),
  body("isAvailable")
    .isInt({ min: 0, max: 1 })
    .withMessage("Availability must be 0 (unavailable) or 1 (available)")
    .bail()
    .toInt(),
  body().custom((req) => {
    if (req.startTime !== null && req.endTime !== null) {
      return validateTimeRange(req.startTime, req.endTime);
    }
    return true;
  }),
];

exports.createMultipleDaysAvailabilityValidations = [
  body("days")
    .isArray({ min: 1 })
    .withMessage("Days data must be a non-empty array")
    .bail()
    .custom((value) => {
      if (value.length > 7) {
        throw new Error("Cannot specify more than 7 days");
      }
      return true;
    })
    .bail(),

  body("days.*.day")
    .notEmpty()
    .withMessage("Day is required for each day")
    .bail()
    .toLowerCase()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Each day must be valid (monday-sunday)")
    .bail()
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const { id } = req.user;
      const { doctor_id: doctorId } = await getDoctorByUserId(id);
      if (!doctorId) {
        throw new Error("Doctor Not Found");
      }
      const existingDay = await db.getSpecificDayAvailability(doctorId, value);
      if (existingDay) {
        throw new Error(
          `Availability for "${value}" already exists, please update it.`,
        );
      }
      return true;
    }),

  body("days.*.startTime")
    .notEmpty()
    .withMessage("Start time is required for each day")
    .bail()
    .custom(validateTimeFormat),

  body("days.*.endTime")
    .notEmpty()
    .withMessage("End time is required for each day")
    .bail()
    .custom(validateTimeFormat),

  body("days.*.isAvailable")
    .isInt({ min: 0, max: 1 })
    .withMessage("Availability must be 0 (unavailable) or 1 (available)")
    .toInt(),

  // Custom validation for each day's time range
  body("days.*").custom((day) => {
    if (day.startTime !== null && day.endTime !== null) {
      return validateTimeRange(day.startTime, day.endTime);
    }
    return true;
  }),

  // Custom validation to check for duplicate days
  body("days").custom((days) => {
    const dayOfWeekSet = new Set();
    days.forEach((d) => {
      const dayLower = d.day?.toLowerCase();
      if (dayOfWeekSet.has(dayLower)) {
        throw new Error(`Duplicate day found: ${d.day}`);
      }
      dayOfWeekSet.add(dayLower);
    });
    return true;
  }),
];

exports.updateWeekendAvailabilityValidations = [
  body("saturdayStartTime")
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      }
      return validateTimeFormat(value);
    })
    .default(null),
  body("saturdayEndTime")
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      }
      return validateTimeFormat(value);
    })
    .default(null),
  body("sundayStartTime")
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      }
      return validateTimeFormat(value);
    })
    .default(null),
  body("sundayEndTime")
    .optional()
    .custom((value) => {
      if (!value) {
        return true;
      }
      return validateTimeFormat(value);
    })
    .default(null),
  body("isAvailableOnSaturday")
    .notEmpty()
    .withMessage("Saturday availability is required")
    .bail()
    .isInt({ min: 0, max: 1 })
    .withMessage(
      "Saturday availability must be 0 (unavailable) or 1 (available)",
    )
    .toInt(),
  body("isAvailableOnSunday")
    .notEmpty()
    .withMessage("Sunday availability is required")
    .bail()
    .isInt({ min: 0, max: 1 })
    .withMessage("Sunday availability must be 0 (unavailable) or 1 (available)")
    .toInt(),
  // Custom validation for Saturday time range
  body().custom((req) => {
    if (req.startTime !== null && req.endTime !== null) {
      return validateTimeRange(req.saturdayStartTime, req.saturdayEndTime);
    }
    return true;
  }),

  // Custom validation for Sunday time range
  body().custom((req) => {
    if (req.startTime !== null && req.endTime !== null) {
      return validateTimeRange(req.sundayStartTime, req.sundayEndTime);
    }
    return true;
  }),
];

exports.updateWorkHoursValidations = [
  body("day")
    .notEmpty()
    .withMessage("Day is required")
    .bail()
    .toLowerCase()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Day must be a valid day")
    .bail()
    .trim()
    .escape(),
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .bail()
    .custom(validateTimeFormat),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .bail()
    .custom(validateTimeFormat),
  // Business hours validation (optional - can be customized)
  //   body("startTime").custom((value) => {
  //     const time = moment(value, "HH:mm:ss");
  //     const minTime = moment("06:00:00", "HH:mm:ss");
  //     const maxTime = moment("22:00:00", "HH:mm:ss");

  //     if (time.isBefore(minTime) || time.isAfter(maxTime)) {
  //       throw new Error("Start time must be between 06:00:00 and 22:00:00");
  //     }
  //     return true;
  //   }),

  //   body("endTime").custom((value) => {
  //     const time = moment(value, "HH:mm:ss");
  //     const minTime = moment("07:00:00", "HH:mm:ss");
  //     const maxTime = moment("23:00:00", "HH:mm:ss");

  //     if (time.isBefore(minTime) || time.isAfter(maxTime)) {
  //       throw new Error("End time must be between 07:00:00 and 23:00:00");
  //     }
  //     return true;
  //   }),

  // Custom validation for time range
  body().custom((req) => {
    if (req.startTime !== null && req.endTime !== null) {
      return validateTimeRange(req.startTime, req.endTime);
    }
    return true;
  }),

  // Minimum work duration validation (optional)
  body().custom((req) => {
    if (req.startTime !== null && req.endTime !== null) {
      const start = moment(req.startTime, "HH:mm:ss");
      const end = moment(req.endTime, "HH:mm:ss");
      const duration = moment.duration(end.diff(start));
      const minHours = 1; // Minimum 1 hour work duration

      if (duration.asHours() < minHours) {
        throw new Error(`Work duration must be at least ${minHours} hour(s)`);
      }
    }
    return true;
  }),
];

exports.updateDayAvailabilityValidations = [
  body("day")
    .notEmpty()
    .withMessage("Day is required")
    .bail()
    .toLowerCase()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Day must be a valid day")
    .bail()
    .trim()
    .escape(),

  body("isAvailable")
    .isInt({ min: 0, max: 1 })
    .withMessage("Availability must be 0 (unavailable) or 1 (available)")
    .toInt(),
];

exports.updateMultipleWorkHoursValidations = [
  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .bail()
    .custom(validateTimeFormat),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .bail()
    .custom(validateTimeFormat),
  // Business hours validation
  //   body("startTime").custom((value) => {
  //     const time = moment(value, "HH:mm:ss");
  //     const minTime = moment("06:00:00", "HH:mm:ss");
  //     const maxTime = moment("22:00:00", "HH:mm:ss");

  //     if (time.isBefore(minTime) || time.isAfter(maxTime)) {
  //       throw new Error("Start time must be between 06:00:00 and 22:00:00");
  //     }
  //     return true;
  //   }),

  //   body("endTime").custom((value) => {
  //     const time = moment(value, "HH:mm:ss");
  //     const minTime = moment("07:00:00", "HH:mm:ss");
  //     const maxTime = moment("23:00:00", "HH:mm:ss");

  //     if (time.isBefore(minTime) || time.isAfter(maxTime)) {
  //       throw new Error("End time must be between 07:00:00 and 23:00:00");
  //     }
  //     return true;
  //   }),

  // Custom validation for time range
  body().custom((req) => {
    if (req.startTime && req.endTime) {
      return validateTimeRange(req.startTime, req.endTime);
    }
    return true;
  }),

  // Minimum work duration validation
  body().custom((req) => {
    if (req.startTime && req.endTime) {
      const start = moment(req.startTime, "HH:mm:ss");
      const end = moment(req.endTime, "HH:mm:ss");
      const duration = moment.duration(end.diff(start));
      const minHours = 2; // Minimum 2 hours for bulk update

      if (duration.asHours() < minHours) {
        throw new Error(`Work duration must be at least ${minHours} hour(s)`);
      }
    }
    return true;
  }),
];
