const logger = require("../../middlewares/logger.middleware");
const service = require("../../services/doctors/days-available.services");

exports.GetDoctorAvailableDaysController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await service.getDoctorAvailableDays(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorSpecificDayAvailabilityController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { day } = req.params;
    const response = await service.getDoctorSpecifyDayAvailabilty(userId, day);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.GetDoctorsAvailableOnSpecificDayController = async (req, res, next) => {
  try {
    const { day } = req.params;
    const response = await service.getDoctorsAvailableOnSpecifyDay(day);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreateDoctorAvailableDaysController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { days } = req.body;
    const response = await service.createDoctorMultipleDaysAvailability({
      userId,
      days,
    });
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.CreateDoctorSingleDayAvailabilityController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { day, startTime, endTime, isAvailable } = req.body;
    const response = await service.createDoctorSingleDayAvailability(
      userId,
      day,
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

exports.UpdateDoctorWeekendAvailabilityController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const {
      saturdayStartTime,
      saturdayEndTime,
      isAvailableOnSaturday,
      sundayStartTime,
      sundayEndTime,
      isAvailableOnSunday,
    } = req.body;
    const response = await service.updateDoctorWeekendAvailability(
      userId,
      saturdayStartTime,
      saturdayEndTime,
      isAvailableOnSaturday,
      sundayStartTime,
      sundayEndTime,
      isAvailableOnSunday,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorWorkHoursController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { day, startTime, endTime } = req.body;
    const response = await service.updateDoctorWorkHoursAvailability(
      userId,
      day,
      startTime,
      endTime,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorMultipleWorkHoursController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { startTime, endTime } = req.body;
    const response = await service.updateDoctorMultipleWorkHoursAvailability(
      userId,
      startTime,
      endTime,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.UpdateDoctorDayAvailabilityController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { day, isAvailable } = req.body;
    const response = await service.updateDoctorDayAvailability(
      userId,
      day,
      isAvailable,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteDoctorSingleDayAvailabilityController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const { day } = req.params;
    const response = await service.deleteDoctorSpecificDayAvailability(
      userId,
      day,
    );
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};

exports.DeleteDoctorAllDaysAvailabilityController = async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id, 10);
    const response = await service.deleteDoctorAllDaysAvailability(userId);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
