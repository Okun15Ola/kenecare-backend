const db = require("../../repository/doctorAvailableDays.repository");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { redisClient } = require("../../config/redis.config");
const { getDoctorByUserId } = require("../../repository/doctors.repository");

exports.getDoctorAvailableDays = async (userId) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const cacheKey = `doctor:${doctorId}:availableDays`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const doctors = await db.getDoctorsAvailableDays(doctorId);
    if (!doctors?.length) {
      return Response.SUCCESS({
        message: "No available days found",
      });
    }

    const availableDays = doctors.map((day) => ({
      dayId: day.day_slot_id,
      day: day.day_of_week,
      startTime: day.day_start_time,
      endTime: day.day_end_time,
      isAvailable: day.is_available,
    }));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(availableDays),
    });

    return Response.SUCCESS({ data: availableDays });
  } catch (error) {
    logger.error("getDoctorAvailableDays: ", error);
    throw error;
  }
};

exports.getDoctorSpecifyDayAvailabilty = async (userId, day) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const cacheKey = `doctor:${doctorId}:day:${day}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const doctor = await db.getSpecificDayAvailability(doctorId, day);
    if (!doctor) {
      logger.error(`Doctor Availabilty For ${day} Not Found`);
      return Response.NOT_FOUND({
        message: `Doctor availabilty for ${day} not found`,
      });
    }

    const availability = {
      dayId: doctor.day_slot_id,
      day: doctor.day_of_week,
      startTime: doctor.day_start_time,
      endTime: doctor.day_end_time,
      isAvailable: doctor.is_available,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(availability),
    });

    return Response.SUCCESS({ data: availability });
  } catch (error) {
    logger.error("getDoctorSpecifyDayAvailabilty: ", error);
    throw error;
  }
};

exports.getDoctorsAvailableOnSpecifyDay = async (dayOfWeek) => {
  try {
    const cacheKey = `doctors-available-on:${dayOfWeek}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const doctors = await db.getDoctorsAvailableOnDay(dayOfWeek);
    if (!doctors?.length) {
      return Response.SUCCESS({
        message: `No doctor available on ${dayOfWeek}`,
      });
    }

    const doctorsDayAvailability = doctors.map((day) => ({
      doctorId: day.doctor_id,
      doctor: `${day.title} ${day.last_name}`,
      day: day.day_of_week,
      startTime: day.day_start_time,
      endTime: day.day_end_time,
    }));

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(doctorsDayAvailability),
    });

    return Response.SUCCESS({ data: doctorsDayAvailability });
  } catch (error) {
    logger.error("getDoctorsAvailableOnSpecifyDay: ", error);
    throw error;
  }
};

exports.createDoctorSingleDayAvailability = async (
  userId,
  dayOfWeek,
  startTime,
  endTime,
  isAvailable,
) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { insertId } = await db.insertSingleDay(
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable,
    );
    if (!insertId) {
      logger.error("Failed to create single day availability");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create single day availability",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: `Doctor ${dayOfWeek} availability created successfully`,
    });
  } catch (error) {
    logger.error("createDoctorSignleDayAvailability: ", error);
    throw error;
  }
};

exports.createDoctorMultipleDaysAvailability = async ({ userId, days }) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);

    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }

    const availabilityData = days.map((day) => [
      doctorId,
      day.day,
      day.startTime,
      day.endTime,
      day.isAvailable,
    ]);
    const { insertId } = await db.insertMultipleDays(availabilityData);
    if (!insertId) {
      logger.error("Failed to create multiple days availability");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create multiple days availability",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor availability for multiple days created successfully",
    });
  } catch (error) {
    logger.error("createDoctorMultipleDaysAvailability: ", error);
    throw error;
  }
};

exports.updateDoctorWeekendAvailability = async (
  userId,
  saturdayStartTime,
  saturdayEndTime,
  isAvailableOnSaturday,
  sundayStartTime,
  sundayEndTime,
  isAvailableOnSunday,
) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { insertId } = await db.updateWeekendAvailability(
      doctorId,
      saturdayStartTime,
      saturdayEndTime,
      isAvailableOnSaturday,
      sundayStartTime,
      sundayEndTime,
      isAvailableOnSunday,
    );
    if (!insertId) {
      logger.error("Failed to update weekend availability");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to update weekend availability",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor weekend availability updated successfully",
    });
  } catch (error) {
    logger.error("updateDoctorWeekendAvailability: ", error);
    throw error;
  }
};

exports.updateDoctorWorkHoursAvailability = async (
  userId,
  dayOfWeek,
  startTime,
  endTime,
) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { affectedRows } = await db.updateWorkingHours(
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
    );
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to update doctor working hours");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor working hours updated successfully",
    });
  } catch (error) {
    logger.error("updateDoctorWorkHoursAvailability: ", error);
    throw error;
  }
};

exports.updateDoctorDayAvailability = async (
  userId,
  dayOfWeek,
  isAvailable,
) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { affectedRows } = await db.updateDayAvailability(
      doctorId,
      dayOfWeek,
      isAvailable,
    );
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to update doctor day availability");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor working days updated successfully",
    });
  } catch (error) {
    logger.error("updateDoctorDayAvailability: ", error);
    throw error;
  }
};

exports.updateDoctorMultipleWorkHoursAvailability = async (
  userId,
  startTime,
  endTime,
) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { affectedRows } = await db.updateBulkWeekdayHours(
      doctorId,
      startTime,
      endTime,
    );
    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "Failed to update doctor multiple working hours availability",
      );
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor working days updated successfully",
    });
  } catch (error) {
    logger.error("updateDoctorMultipleWorkHoursAvailability: ", error);
    throw error;
  }
};

exports.deleteDoctorSpecificDayAvailability = async (userId, dayOfWeek) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { affectedRows } = await db.deleteSpecificDay(doctorId, dayOfWeek);
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to delete specific day availability");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: `Doctor's ${dayOfWeek} availability deleted successfully`,
    });
  } catch (error) {
    logger.error("deleteDoctorSpecificDay: ", error);
    throw error;
  }
};

exports.deleteDoctorAllDaysAvailability = async (userId) => {
  try {
    const { doctor_id: doctorId } = await getDoctorByUserId(userId);
    if (!doctorId) {
      logger.error("Doctor not found for the given user ID");
      return Response.NOT_FOUND({ message: "Doctor not found" });
    }
    const { affectedRows } = await db.deleteAllDoctorAvailability(doctorId);
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to delete doctor days availability");
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:*`);

    return Response.SUCCESS({
      message: "Doctor's all days availability deleted successfully",
    });
  } catch (error) {
    logger.error("deleteDoctorAllDays: ", error);
    throw error;
  }
};
