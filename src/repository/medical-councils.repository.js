const { query } = require("./db.connection");
const queries = require("./queries/medicalCouncils.queries");

exports.getAllMedicalCouncils = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_ALL_MEDICAL_COUNCILS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.countMedicalCouncils = async () => {
  const result = await query(queries.COUNT_MEDICAL_COUNCILS);
  return result[0];
};

exports.getMedicalCouncilById = async (id) => {
  const result = await query(queries.GET_MEDICAL_COUNCIL_BY_ID, [id]);
  return result[0];
};

exports.getMedicalCouncilByEmail = async (email) => {
  const result = await query(queries.GET_MEDICAL_COUNCIL_BY_EMAIL, [email]);
  return result[0];
};

exports.getMedicalCouncilByMobileNumber = async (mobileNumber) => {
  const result = await query(queries.GET_MEDICAL_COUNCIL_BY_MOBILE, [
    mobileNumber,
  ]);
  return result[0];
};

exports.createNewMedicalCouncil = async (council) => {
  const { name, email, mobileNumber, address, inputtedBy } = council;
  return query(queries.CREATE_MEDICAL_COUNCIL, [
    name,
    email,
    mobileNumber,
    address,
    inputtedBy,
  ]);
};

exports.updateMedicalCouncilById = async ({
  id,
  name,
  email,
  mobileNumber,
  address,
}) => {
  return query(queries.UPDATE_MEDICAL_COUNCIL_BY_ID, [
    name,
    email,
    mobileNumber,
    address,
    id,
  ]);
};

exports.updateMedicalCouncilStatusById = async ({ id, status }) => {
  return query(queries.UPDATE_MEDICAL_COUNCIL_STATUS_BY_ID, [status, id]);
};

exports.deleteMedicalCouncilById = async (id) => {
  return query(queries.DELETE_MEDICAL_COUNCIL_BY_ID, [id]);
};

exports.getAllActiveDoctorRegistrationsWithDoctorDetails = async () => {
  return query(queries.SELECT_ACTIVE_DOCTOR_REGISTRATIONS_WITH_DETAILS);
};
