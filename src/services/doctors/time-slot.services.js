const repo = require("../../repository/doctorTimeSlot.repository");
const logger = require("../../middlewares/logger.middleware");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { doctorTimeSlot } = require("../../constants/doctor.constants");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");

const ERROR_500 = "Something went wrong. Please try again!";

exports.getAvailableSlotsForWeek = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:time-slot:week`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await repo.getAvailableSlotsForWeek(doctorId);

    if (!data?.length) {
      logger.warn("Doctor week available slot not found");
      return Response.SUCCESS({
        message: "Doctor available slot for current week not found",
        data: [],
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("error fetching available week time slot for doctor", error);
    throw error;
  }
};

exports.getAvailableSlotsForDay = async (userId, day) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:time-slot:day:${day}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await repo.getAvailableSlotsForDay(doctorId, day);

    if (!data?.length) {
      logger.warn("Doctor day available slot not found");
      return Response.SUCCESS({
        message: "Doctor available slot for today not found",
        data: [],
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("error fetching available day time slot for doctor", error);
    throw error;
  }
};

exports.getBookedSlots = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:time-slot:booked-slots`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await repo.getBookedSlots(doctorId);

    if (!data?.length) {
      return Response.SUCCESS({
        message: "Current Doctor have no booked time slots",
        data: [],
      });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("error fetching booked time slot for doctor", error);
    throw error;
  }
};

exports.createDoctorTimeSlot = async (
  userId,
  daySlotId,
  slotStartTime,
  slotEndTime,
  isSlotAvailable,
) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const { insertId } = await repo.createDoctorTimeSlot({
      doctorId,
      daySlotId,
      slotStartTime,
      slotEndTime,
      isSlotAvailable,
    });

    if (!insertId) {
      logger.error("Fail to create doctor time slot");
      return Response.INTERNAL_SERVER_ERROR({
        message: ERROR_500,
      });
    }
    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Time slot created successfully" });
  } catch (error) {
    logger.error("Error creating doctor time slot:", error);
    throw error;
  }
};

exports.createMultipleDoctorTimeSlots = async (userId, slots) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const availableSlots = slots.map((slot) => [
      doctorId,
      slot.daySlotId,
      slot.slotStartTime,
      slot.slotEndTime,
      slot.isSlotAvailable,
    ]);

    const { insertId } = await repo.bulkInsertDoctorTimeSlots(availableSlots);

    if (!insertId) {
      logger.error("Fail to create doctor's time slots");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Time slots created successfully" });
  } catch (error) {
    logger.error("Error creating multiple doctor time slot:", error);
    throw error;
  }
};

exports.markSlotAvailable = async (userId, slotId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.markSlotAvailable(slotId, doctorId);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor time slot");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Time slot updated successfully" });
  } catch (error) {
    logger.error("Error updating doctor time slot:", error);
    throw error;
  }
};

exports.markSlotUnavailable = async (userId, slotId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.markSlotUnavailable(slotId, doctorId);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor time slot");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Time slot updated successfully" });
  } catch (error) {
    logger.error("Error updating doctor time slot:", error);
    throw error;
  }
};

exports.updateSlotTiming = async (
  userId,
  slotId,
  slotStartTime,
  slotEndTime,
) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.updateSlotTiming(
      slotId,
      slotStartTime,
      slotEndTime,
      doctorId,
    );

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor slot timing");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Slot timing updated successfully" });
  } catch (error) {
    logger.error("Error updating doctor time slot:", error);
    throw error;
  }
};

exports.markDaySlotsUnavailable = async (userId, day) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.bulkMarkDayUnavailable(doctorId, day);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor unavailable days");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Slot timing updated successfully" });
  } catch (error) {
    logger.error("Error updating doctor time slot:", error);
    throw error;
  }
};

exports.deleteSlotById = async (id, userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.deleteTimeSlot(id);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete doctor time slot");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({ message: "Slot deleted successfully" });
  } catch (error) {
    logger.error("Error deleting doctor time slot:", error);
    throw error;
  }
};

exports.deleteDaySlots = async (userId, day) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.deleteSlotsForDay(doctorId, day);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete doctor day time slot");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({
      message: `${day} Time slot deleted successfully`,
    });
  } catch (error) {
    logger.error("Error deleting doctor day time slot:", error);
    throw error;
  }
};

exports.deleteDoctorSlots = async (userId) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const { affectedRows } = await repo.deleteSlotsForDoctor(doctorId);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete doctor time slots");
      return Response.INTERNAL_SERVER_ERROR({ message: ERROR_500 });
    }

    await redisClient.clearCacheByPattern(doctorTimeSlot(doctorId));

    return Response.SUCCESS({
      message: "Doctor time slots deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting doctor time slots:", error);
    throw error;
  }
};
