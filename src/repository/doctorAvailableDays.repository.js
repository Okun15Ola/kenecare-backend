const queries = require("./queries/doctorAvailableDays.queries");
const { query } = require("./db.connection");

exports.getDoctorsAvailableDays = async (doctorId) => {
  return query(queries.SELECT_AVAILABLE_DAYS_FOR_DOCTOR, [doctorId]);
};

exports.getSpecificDayAvailability = async (doctorId, dayOfWeek) => {
  const row = await query(queries.SELECT_SPECIFIC_DAY_AVAILABILITY, [
    doctorId,
    dayOfWeek,
  ]);
  return row[0];
};

exports.getDoctorsAvailableOnDay = async (dayOfWeek) => {
  return query(queries.SELECT_DOCTORS_AVAILABLE_ON_DAY, [dayOfWeek]);
};

exports.insertSingleDay = async (
  doctorId,
  dayOfWeek,
  startTime,
  endTime,
  isAvailable,
) => {
  return query(queries.INSERT_SINGLE_DAY, [
    doctorId,
    dayOfWeek,
    startTime,
    endTime,
    isAvailable,
  ]);
};

exports.insertMultipleDays = async (values) => {
  return query(queries.INSERT_MULTIPLE_DAYS, [values]);
};

exports.updateWeekendAvailability = async (
  doctorId,
  saturdayStartTime,
  saturdayEndTime,
  isAvailableOnSaturday,
  sundayStartTime,
  sundayEndTime,
  isAvailableOnSunday,
) => {
  return query(queries.UPSERT_WEEKEND_AVAILABILITY, [
    doctorId,
    saturdayStartTime,
    saturdayEndTime,
    isAvailableOnSaturday,
    doctorId,
    sundayStartTime,
    sundayEndTime,
    isAvailableOnSunday,
  ]);
};

exports.updateWorkingHours = async (
  doctorId,
  dayOfWeek,
  startTime,
  endTime,
) => {
  return query(queries.UPDATE_WORKING_HOURS, [
    startTime,
    endTime,
    doctorId,
    dayOfWeek,
  ]);
};

exports.updateDayAvailability = async (doctorId, dayOfWeek, isAvailable) => {
  return query(queries.UPDATE_TOGGLE_AVAILABILITY, [
    isAvailable,
    doctorId,
    dayOfWeek,
  ]);
};

exports.updateBulkWeekdayHours = async (doctorId, startTime, endTime) => {
  return query(queries.UPDATE_BULK_WEEKDAY_HOURS, [
    startTime,
    endTime,
    doctorId,
  ]);
};

exports.deleteSpecificDay = async (doctorId, dayOfWeek) => {
  return query(queries.DELETE_SPECIFIC_DAY, [doctorId, dayOfWeek]);
};

exports.deleteAllDoctorAvailability = async (doctorId) => {
  return query(queries.DELETE_ALL_DOCTOR_AVAILABILITY, [doctorId]);
};
