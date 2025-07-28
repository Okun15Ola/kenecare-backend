const { query } = require("./db.connection");
const queries = require("./queries/doctorTimeSlot.queries");

exports.createDoctorTimeSlot = async ({
  doctorId,
  daySlotId,
  slotStartTime,
  slotEndTime,
  isSlotAvailable,
}) => {
  return query(queries.CREATE_DOCTOR_TIME_SLOT, [
    doctorId,
    daySlotId,
    slotStartTime,
    slotEndTime,
    isSlotAvailable,
  ]);
};

exports.bulkInsertDoctorTimeSlots = async (slots) => {
  // slots should be an array of arrays: [[doctorId, daySlotId, slotStartTime, slotEndTime, isSlotAvailable], ...]
  return query(queries.BULK_INSERT_DOCTOR_TIME_SLOTS, [slots]);
};

exports.getAvailableSlotsForDay = async (doctorId, dayOfWeek) => {
  return query(queries.GET_AVAILABLE_SLOTS_FOR_DAY, [doctorId, dayOfWeek]);
};

exports.getAvailableSlotsForWeek = async (doctorId) => {
  return query(queries.GET_AVAILABLE_SLOTS_FOR_WEEK, [doctorId]);
};

exports.getBookedSlots = async (doctorId) => {
  return query(queries.GET_BOOKED_SLOTS, [doctorId]);
};

exports.markSlotUnavailable = async (timeSlotId, doctorId) => {
  return query(queries.MARK_SLOT_UNAVAILABLE, [timeSlotId, doctorId]);
};

exports.markSlotAvailable = async (timeSlotId, doctorId) => {
  return query(queries.MARK_SLOT_AVAILABLE, [timeSlotId, doctorId]);
};

exports.updateSlotTiming = async ({
  timeSlotId,
  slotStartTime,
  slotEndTime,
  doctorId,
}) => {
  return query(queries.UPDATE_SLOT_TIMING, [
    slotStartTime,
    slotEndTime,
    timeSlotId,
    doctorId,
  ]);
};

exports.getSlotById = async (id) => {
  const row = await query(queries.SELECT_SLOT_BY_ID, [id]);
  return row[0];
};

exports.bulkMarkDayUnavailable = async (doctorId, dayOfWeek) => {
  return query(queries.BULK_MARK_DAY_UNAVAILABLE, [doctorId, dayOfWeek]);
};

exports.deleteTimeSlot = async (timeSlotId) => {
  return query(queries.DELETE_TIME_SLOT, [timeSlotId]);
};

exports.deleteSlotsForDay = async (doctorId, dayOfWeek) => {
  return query(queries.DELETE_SLOTS_FOR_DAY, [doctorId, dayOfWeek]);
};

exports.deleteSlotsForDoctor = async (doctorId) => {
  return query(queries.DELETE_SLOTS_FOR_DOCTOR, [doctorId]);
};

exports.deleteSlots = async () => {
  return query(queries.DELETE_SLOTS);
};
