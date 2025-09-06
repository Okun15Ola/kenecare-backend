const { query } = require("./db.connection");
const queries = require("./queries/doctors.queries");

exports.getAllDoctors = async (limit, offset) => {
  const optimizedQuery =
    limit && offset
      ? `${queries.GET_ALL_DOCTORS} LIMIT ${limit} OFFSET ${offset};`
      : queries.GET_ALL_DOCTORS;
  return query(optimizedQuery);
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
  const optimizedQuery = `${queries.GET_DOCTORS_BY_CITY_ID} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery, [cityId]);
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
  const optimizedQuery = `${queries.GET_DOCTORS_BY_SPECIALIZATION_ID} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery, [specializationId]);
};
exports.getDoctorsSpecializationCount = async (specializationId) => {
  const row = await query(queries.GET_DOCTORS_BY_SPECIALIZATION_ID_COUNT, [
    specializationId,
  ]);
  return row[0];
};
exports.getDoctorsByHospitalId = async (hospitalId, limit, offset) => {
  const optimizedQuery = `${queries.GET_DOCTORS_BY_HOSPITAL_ID} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery, [hospitalId]);
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
  const optimizedQuery = `${queries.GET_DOCTOR_ALL_COUNCIL_REGISTRATIONS} LIMIT ${limit} OFFSET ${offset};`;
  return query(optimizedQuery);
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
