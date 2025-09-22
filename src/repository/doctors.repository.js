const { query } = require("./db.connection");
const queries = require("./queries/doctors.queries");

exports.getAllDoctors = async (limit, offset) => {
  return query(queries.GET_ALL_DOCTORS, [offset, limit]);
};
exports.getDoctorsCount = async () => {
  const row = await query(queries.GET_DOCTORS_COUNT);
  return row[0];
};
exports.getDoctorByQuery = async ({
  locationId,
  query: search,
  limit,
  offset,
}) => {
  return query(queries.SEARCH_DOCTOR_BY_QUERY, [
    locationId,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    offset,
    limit,
  ]);
};
exports.getDoctorsQueryCount = async ({ locationId, query: search }) => {
  const row = await query(queries.COUNT_SEARCH_DOCTOR_BY_QUERY, [
    locationId,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
  ]);
  return row[0];
};
exports.getDoctorById = async (doctorId) => {
  const result = await query(queries.GET_DOCTOR_BY_ID, [doctorId]);
  return result[0];
};
exports.getDoctorByUserId = async (userId) => {
  const result = await query(queries.GET_DOCTOR_BY_USER_ID, [userId]);
  return result[0];
};
exports.getDoctorsByCityId = async (cityId, limit, offset) => {
  return query(queries.GET_DOCTORS_BY_CITY_ID, [cityId, offset, limit]);
};
exports.getDoctorsCityCount = async (cityId) => {
  const row = await query(queries.GET_DOCTORS_COUNT_BY_CITY, [cityId]);
  return row[0];
};
exports.getDoctorsBySpecializationId = async (
  specializationId,
  limit,
  offset,
) => {
  return query(queries.GET_DOCTORS_BY_SPECIALIZATION_ID, [
    specializationId,
    offset,
    limit,
  ]);
};
exports.getDoctorsSpecializationCount = async (specializationId) => {
  const row = await query(queries.GET_DOCTORS_BY_SPECIALIZATION_ID_COUNT, [
    specializationId,
  ]);
  return row[0];
};
exports.getDoctorsByHospitalId = async (hospitalId, limit, offset) => {
  return query(queries.GET_DOCTORS_BY_HOSPITAL_ID, [hospitalId, offset, limit]);
};
exports.getDoctorsHospitalCount = async (hospitalId) => {
  const row = await query(queries.GET_DOCTORS_BY_HOSPITAL_ID_COUNT, [
    hospitalId,
  ]);
  return row[0];
};
exports.getCouncilRegistrationByDoctorId = async (doctorId) => {
  const result = await query(
    queries.GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID,
    [doctorId],
  );
  return result[0];
};
exports.getAllMedicalCouncilRegistration = async (limit, offset) => {
  return query(queries.GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS, [offset, limit]);
};
exports.getAllMedicalCouncilRegistrationCount = async () => {
  const row = await query(queries.GET_DOCTOR_COUNCIL_REGISTRATION_COUNT);
  return row[0];
};
exports.getCouncilRegistrationById = async (registrationId) => {
  const result = await query(queries.GET_DOCTOR_COUNCIL_REGISTRATION_BY_ID, [
    registrationId,
  ]);
  return result[0];
};

exports.getCouncilRegistrationByRegNumber = async (registrationNumber) => {
  const result = await query(
    queries.GET_DOCTOR_COUNCIL_REGISTRATION_BY_REG_NUMBER,
    [registrationNumber],
  );
  return result[0];
};

exports.createDoctor = async ({
  userId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  return query(queries.CREATE_DOCTOR, [
    userId,
    title,
    firstName,
    middleName,
    lastName,
    gender,
    professionalSummary,
    specializationId,
    qualifications,
    consultationFee,
    cityId,
    yearOfExperience,
  ]);
};

exports.createDoctorMedicalCouncilRegistration = async ({
  doctorId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  fileName,
}) => {
  return query(queries.CREATE_DOCTOR_COUNCIL_REGISTRATION, [
    doctorId,
    councilId,
    regNumber,
    regYear,
    fileName,
    certIssuedDate,
    certExpiryDate,
  ]);
};

exports.updateDoctorMedicalCouncilRegistration = async ({
  registrationId,
  doctorId,
  councilId,
  regNumber,
  regYear,
  certIssuedDate,
  certExpiryDate,
  fileName,
}) => {
  return query(queries.UPDATE_DOCTOR_COUNCIL_REGISTRATION, [
    councilId,
    regNumber,
    regYear,
    fileName,
    certIssuedDate,
    certExpiryDate,
    registrationId,
    doctorId,
  ]);
};

exports.getDoctorMedicalCouncilRegistration = async ({ doctorId }) => {
  return query(queries.GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID, [
    doctorId,
  ]);
};

exports.updateDoctorById = async ({
  doctorId,
  title,
  firstName,
  middleName,
  lastName,
  gender,
  professionalSummary,
  specializationId,
  qualifications,
  consultationFee,
  cityId,
  yearOfExperience,
}) => {
  return query(queries.UPDATE_DOCTOR, [
    title,
    firstName,
    middleName,
    lastName,
    gender,
    professionalSummary,
    specializationId,
    qualifications,
    consultationFee,
    cityId,
    yearOfExperience,
    doctorId,
  ]);
};

exports.updateDoctorProfilePictureById = async ({ doctorId, imageUrl }) => {
  return query(queries.UPDATE_DOCTOR_PROFILE_PICTURE, [imageUrl, doctorId]);
};

exports.approveDoctorProfileByDoctorId = async ({ doctorId, approvedBy }) => {
  return query(queries.APPROVE_DOCTOR_PROFILE, [approvedBy, doctorId]);
};

exports.verifyDoctorCredentials = async (doctorId) => {
  const row = await query(queries.VERIFY_DOCTOR, [doctorId]);
  return row[0];
};

exports.updateDoctorSignature = async (signatureUrl, doctorId) => {
  return query(queries.UPDATE_DOCTOR_SIGNATURE, [signatureUrl, doctorId]);
};
