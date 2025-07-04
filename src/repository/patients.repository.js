const { query } = require("./db.connection");
const queries = require("./queries/patients.queries");

exports.getAllPatients = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_PATIENTS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getPatientById = async (id) => {
  const result = await query(queries.GET_PATIENT_BY_ID, [id]);
  return result[0];
};

exports.getPatientByUserId = async (userId) => {
  const result = await query(queries.GET_PATIENT_BY_USER_ID, [userId]);
  return result[0];
};

exports.getPatientsByCityId = async (cityId) => {
  return query(queries.GET_PATIENTS_BY_CITY_ID, [cityId]);
};

exports.createPatient = async ({
  userId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  return query(queries.CREATE_PATIENT, [
    userId,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
  ]);
};

exports.createPatientMedicalInfo = async ({
  patientId,
  height,
  weight,
  allergies,
  isDisabled,
  disabilityDesc,
  tobaccoIntake,
  tobaccoIntakeFreq,
  alcoholIntake,
  alcoholIntakeFreq,
  caffineIntake,
  caffineIntakeFreq,
}) => {
  return query(queries.CREATE_PATIENT_MEDICAL_INFO, [
    patientId,
    height,
    weight,
    allergies,
    isDisabled,
    disabilityDesc,
    tobaccoIntake,
    tobaccoIntakeFreq,
    alcoholIntake,
    alcoholIntakeFreq,
    caffineIntake,
    caffineIntakeFreq,
  ]);
};

exports.getPatientMedicalInfoByPatientId = async (patientId) => {
  const result = await query(queries.GET_PATIENT_MEDICAL_INFO_BY_PATIENT_ID, [
    patientId,
  ]);
  return result[0];
};

exports.updatePatientById = async ({
  patientId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
}) => {
  return query(queries.UPDATE_PATIENT_BY_ID, [
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    patientId,
  ]);
};

exports.updatePatientFirstAppointmentStatus = async (patientId) => {
  return query(queries.UPDATE_PATIENT_FIRST_APPOINTMENT_STATUS, [patientId]);
};

exports.updatePatientProfilePictureByUserId = async ({ userId, imageUrl }) => {
  return query(queries.UPDATE_PATIENT_PROFILE_PICTURE_BY_USER_ID, [
    imageUrl,
    userId,
  ]);
};

exports.updatePatientMedicalHistory = async ({
  patientId,
  height,
  weight,
  allergies,
  isDisabled,
  disabilityDesc,
  tobaccoIntake,
  tobaccoIntakeFreq,
  alcoholIntake,
  alcoholIntakeFreq,
  caffineIntake,
  caffineIntakeFreq,
}) => {
  return query(queries.UPDATE_PATIENT_MEDICAL_HISTORY, [
    height,
    weight,
    allergies,
    isDisabled,
    disabilityDesc,
    tobaccoIntake,
    tobaccoIntakeFreq,
    alcoholIntake,
    alcoholIntakeFreq,
    caffineIntake,
    caffineIntakeFreq,
    patientId,
  ]);
};
