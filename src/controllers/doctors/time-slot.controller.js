const services = require("../../services/doctors/time-slot.services");
const logger = require("../../middlewares/logger.middleware");

exports.getDoctorWeekSlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await services.getAvailableSlotsForWeek(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getDoctorAvailableDaySlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { day } = req.params;
    const response = await services.getAvailableSlotsForDay(id, day);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.getDoctorBookedSlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await services.getBookedSlots(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.createSlotController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { daySlotId, startTime, endTime, isAvailable } = req.body;
    const response = await services.createDoctorTimeSlot(
      id,
      daySlotId,
      startTime,
      endTime,
      isAvailable,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.createMultipleTimeSlotsSlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { slots } = req.body;
    const response = await services.createMultipleDoctorTimeSlots(id, slots);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.markSlotAvailableController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { slotId } = req.params;
    const response = await services.markSlotAvailable(id, slotId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.markSlotUnvailableController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { slotId } = req.params;
    const response = await services.markSlotUnavailable(id, slotId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.updateSlotTimingController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { slotId, startTime, endTime } = req.body;
    const response = await services.updateSlotTiming(
      id,
      slotId,
      startTime,
      endTime,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.markDaySlotUnavailableController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { day } = req.params;
    const response = await services.markDaySlotsUnavailable(id, day);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.deleteDaySlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const { day } = req.params;
    const response = await services.deleteDaySlots(id, day);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.deleteSlotByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.user.id, 10);
    const response = await services.deleteSlotById(id, userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.deleteDoctorWeekSlotsController = async (req, res, next) => {
  try {
    const id = parseInt(req.user.id, 10);
    const response = await services.deleteDoctorSlots(id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
