const { query } = require("./db.connection");
const queries = require("./queries/adminDoctors.queries");

exports.getAllDoctors = async (limit, offset) => {
  const optimizedQuery =
    limit && offset
      ? `${queries.GET_ALL_DOCTORS} LIMIT ${limit} OFFSET ${offset};`
      : queries.GET_ALL_DOCTORS;
  return query(optimizedQuery);
};

exports.getAllMedicalCouncilRegistrationCount = async () => {
  const row = await query(queries.GET_DOCTOR_COUNCIL_REGISTRATION_COUNT);
  return row[0];
};

exports.countDoctors = async () => {
  const row = await query(queries.COUNT_DOCTORS);
  return row[0];
};

exports.getDoctorByQuery = async ({
  locationId,
  query: search,
  limit,
  offset,
}) => {
  const optimizedQuery = `${queries.SEARCH_DOCTOR_BY_QUERY} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery, [
    locationId,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
    `%${search}%`,
  ]);
};

exports.getDoctorById = async (doctorId) => {
  const result = await query(queries.GET_DOCTOR_BY_ID, [doctorId]);
  return result[0];
};

exports.getCouncilRegistrationByDoctorId = async (doctorId) => {
  const result = await query(
    queries.GET_DOCTOR_COUNCIL_REGISTRATION_BY_DOCTOR_ID,
    [doctorId],
  );
  return result[0];
};

exports.getAllMedicalCouncilRegistration = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery);
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

exports.approveDoctorMedicalCouncilRegistrationById = async ({
  registrationId,
  approvedBy,
}) => {
  return query(queries.APPROVE_DOCTOR_COUNCIL_REGISTRATION, [
    approvedBy,
    registrationId,
  ]);
};

exports.rejectDoctorMedicalCouncilRegistrationById = async ({
  registrationId,
  rejectionReason,
  approvedBy,
}) => {
  return query(queries.REJECT_DOCTOR_COUNCIL_REGISTRATION, [
    rejectionReason,
    approvedBy,
    registrationId,
  ]);
};
