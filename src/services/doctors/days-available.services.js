const moment = require("moment");
const db = require("../../repository/doctorAvailableDays.repository");
const Response = require("../../utils/response.utils");
const logger = require("../../middlewares/logger.middleware");
const { redisClient } = require("../../config/redis.config");
const { getDoctorByUserId } = require("../../repository/doctors.repository");
const {
  getDoctorTodayAppointments,
  getDoctorAppointmentsDateRange,
} = require("../../repository/doctorAppointments.repository");
const {
  bulkMarkDayUnavailable,
  deleteSlotsForDoctor,
  deleteSlotsForDay,
} = require("../../repository/doctorTimeSlot.repository");
const {
  generateDoctorTimeSlotsForAvailableDay,
} = require("../../utils/time.utils");

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
        data: [],
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
    const cacheKey = `doctor:${doctorId}:availableDays:${day}`;
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
    const cacheKey = `doctors:available-on:${dayOfWeek}`;
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

    const updatedTimeSlots = await generateDoctorTimeSlotsForAvailableDay(
      doctorId,
      dayOfWeek,
    );

    if (!updatedTimeSlots.success) {
      logger.error("Error generating timeslot: ", updatedTimeSlots.message);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again",
      });
    }

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    // Generate time slots for each day
    const timeslotPromises = days.map(async (day) => {
      if (day.isAvailable) {
        try {
          return await generateDoctorTimeSlotsForAvailableDay(
            doctorId,
            day.day,
          );
        } catch (error) {
          logger.warn(`Failed to generate time slots for ${day.day}:`, error);
          return { day: day.day, success: false };
        }
      }
      return {
        day: day.day,
        success: true,
        message: "Day not marked as available",
      };
    });

    await Promise.all([
      ...timeslotPromises,
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    // TODO: check if appointment exist then throw conflict error
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

    if (isAvailableOnSaturday === 0) {
      await bulkMarkDayUnavailable(doctorId, "saturday");
    } else {
      await generateDoctorTimeSlotsForAvailableDay(doctorId, "saturday");
    }

    if (isAvailableOnSunday === 0) {
      await bulkMarkDayUnavailable(doctorId, "sunday");
    } else {
      await generateDoctorTimeSlotsForAvailableDay(doctorId, "sunday");
    }

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    const appointments = await getDoctorTodayAppointments(doctorId);

    if (appointments?.length > 0) {
      // Check if any appointments are for the day being updated
      const dayAppointments = appointments.filter((appt) => {
        const appointmentDate = new Date(appt.appointment_date);
        const appointmentDayName = appointmentDate.toLocaleLowerCase("en-US", {
          weekday: "long",
        });
        return appointmentDayName === dayOfWeek.toLowerCase();
      });

      if (dayAppointments.length > 0) {
        logger.warn(
          `Cannot update ${dayOfWeek} availability due to existing appointments`,
        );
        return Response.CONFLICT({
          message: `Cannot update ${dayOfWeek} availability because you have ${dayAppointments.length} appointment(s) scheduled on this day`,
        });
      }
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

    const updatedTimeSlots = await generateDoctorTimeSlotsForAvailableDay(
      doctorId,
      dayOfWeek,
    );

    if (!updatedTimeSlots.success) {
      logger.error("Error generating timeslot: ", updatedTimeSlots.message);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again",
      });
    }
    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    const appointments = await getDoctorTodayAppointments(doctorId);
    if (appointments?.length > 0) {
      return Response.CONFLICT({
        message:
          "Cannot update doctor availability because you still have unattended appointments for this period",
      });
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

    if (isAvailable === 0) {
      await bulkMarkDayUnavailable(doctorId, dayOfWeek);
    }

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    // Get the current day of week using moment.js
    const today = moment();
    const currentDayNumber = today.day(); // 0 = Sunday, 6 = Saturday

    // Only proceed with weekday checks if today is a weekday (Monday-Friday)
    if (currentDayNumber >= 1 && currentDayNumber <= 5) {
      // Calculate date range from today to Friday
      const daysUntilFriday = 5 - currentDayNumber; // Friday is day 5
      const endDate = moment(today).add(daysUntilFriday, "days");

      // Format dates for SQL query
      const startDateFormatted = today.format("YYYY-MM-DD");
      const endDateFormatted = endDate.format("YYYY-MM-DD");

      // Check for appointments from today until Friday
      const appointments = await getDoctorAppointmentsDateRange(
        doctorId,
        startDateFormatted,
        endDateFormatted,
      );

      if (appointments && appointments.length > 0) {
        return Response.CONFLICT({
          message: "Cannot update weekday hours due to existing appointments",
        });
      }
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

    // Generate time slots for each weekday
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    const timeslotPromises = weekdays.map(async (day) => {
      try {
        const result = await generateDoctorTimeSlotsForAvailableDay(
          doctorId,
          day,
        );
        if (!result.success) {
          logger.warn(
            `Failed to generate time slots for ${day}: ${result.message}`,
          );
        }
        return { day, success: result.success };
      } catch (error) {
        logger.error(`Error generating time slots for ${day}:`, error);
        return { day, success: false };
      }
    });

    await Promise.all([
      ...timeslotPromises,
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

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

    // check if the doctor have any booked appointments among these days before delete
    const appointments = await getDoctorTodayAppointments(doctorId);

    if (appointments?.length > 0) {
      logger.warn("Cannot delete doctor availability because yo appointments");
      return Response.CONFLICT({
        message:
          "Cannot delete doctor availability because you still have unattended appointments for this period",
      });
    }

    const { affectedRows } = await db.deleteSpecificDay(doctorId, dayOfWeek);
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to delete specific day availability");
      return Response.NOT_MODIFIED({});
    }

    await deleteSlotsForDay(doctorId, dayOfWeek);

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);
    return Response.SUCCESS({
      message: `Doctor's ${dayOfWeek} availability deleted successfully`,
    });
  } catch (error) {
    logger.error("deleteDoctorSpecificDayAvailability: ", error);
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

    // Check for any upcoming appointments before deleting availability
    const today = moment().format("YYYY-MM-DD");
    const futureDate = moment().add(30, "days").format("YYYY-MM-DD");
    const appointments = await getDoctorAppointmentsDateRange(
      doctorId,
      today,
      futureDate,
    );

    if (appointments?.length > 0) {
      logger.warn(
        `Cannot delete all days: Doctor has ${appointments.length} upcoming appointments`,
      );
      return Response.CONFLICT({
        message:
          "Cannot delete all availability days because you have upcoming appointments",
      });
    }

    const { affectedRows } = await db.deleteAllDoctorAvailability(doctorId);
    if (!affectedRows || affectedRows < 1) {
      logger.error("Failed to delete doctor days availability");
      return Response.NOT_MODIFIED({});
    }

    await deleteSlotsForDoctor(doctorId);

    await Promise.all([
      redisClient.clearCacheByPattern(`doctor:${doctorId}:availableDays:*`),
      redisClient.delete(`doctor:${doctorId}:availableDays`),
      redisClient.clearCacheByPattern("doctors:available-on:*"),
      redisClient.clearCacheByPattern(`doctor:${doctorId}:time-slot:*`),
    ]);

    return Response.SUCCESS({
      message: "Doctor's all days availability deleted successfully",
    });
  } catch (error) {
    logger.error("deleteDoctorAllDaysAvailability: ", error);
    throw error;
  }
};
