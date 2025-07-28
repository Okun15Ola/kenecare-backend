const { body, param } = require("express-validator");
const moment = require("moment");
const db = require("../../repository/doctorTimeSlot.repository");
const {
  validateTimeRange,
  normalizeAndValidateTime,
} = require("../../utils/time.utils");

exports.validateSlotIdParam = [
  param("slotId")
    .exists()
    .withMessage("slot ID is required")
    .isInt({ gt: 0 })
    .withMessage("slot ID must be a number greater than 0"),
];

exports.validateSlotIdBody = [
  body("slotId")
    .exists()
    .withMessage("slot ID is required")
    .isInt({ gt: 0 })
    .withMessage("slot ID must be a number greater than 0"),
];

exports.dayParamValidation = [
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

exports.validateSlotTiming = [
  body("startTime")
    .exists()
    .withMessage("startTime is required")
    .bail()
    .custom(normalizeAndValidateTime),

  body("endTime")
    .exists()
    .withMessage("endTime is required")
    .bail()
    .custom(normalizeAndValidateTime),

  body().custom((value) => {
    validateTimeRange(value.startTime, value.endTime);
    return true;
  }),

  body().custom((req) => {
    if (req.startTime && req.endTime) {
      const start = moment(req.startTime, "HH:mm:ss");
      const end = moment(req.endTime, "HH:mm:ss");
      const duration = moment.duration(end.diff(start));
      const minMinutes = 30;

      if (duration.asMinutes() < minMinutes) {
        throw new Error(
          `Slot duration must be at least ${minMinutes} minutes from start Time`,
        );
      }
    }
    return true;
  }),
  body("startTime").custom(async (value, { req }) => {
    const availableDay = await db.getSlotById(parseInt(req.params.slotId, 10));

    if (!availableDay) {
      throw new Error("Doctor is unavailable");
    }

    const { isDayAvailable, dayStartTime, dayEndTime } = availableDay;

    if (isDayAvailable === 0) {
      throw new Error("Doctor is unavailable for today");
    }

    const time = moment(value, "mm:ss");
    const minTime = moment(dayStartTime, "HH:mm:ss");
    const maxTime = moment(dayEndTime, "HH:mm:ss");

    if (time.isBefore(minTime) || time.isAfter(maxTime)) {
      throw new Error(
        `Start time must be between ${dayStartTime} and ${dayEndTime}`,
      );
    }
    return true;
  }),

  body("endTime").custom((value) => {
    const time = moment(value, "HH:mm:ss");
    const minTime = moment("07:00:00", "HH:mm:ss");
    const maxTime = moment("23:00:00", "HH:mm:ss");

    if (time.isBefore(minTime) || time.isAfter(maxTime)) {
      throw new Error("End time must be between 07:00:00 and 23:00:00");
    }
    return true;
  }),
];
