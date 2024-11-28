const { query } = require("./db.connection");
const {
  GET_ALL_MARKETERS,
  GET_MARKETER_BY_ID,
  GET_MARKETER_BY_EMAIL,
  GET_MARKETER_BY_PHONE,
  GET_MARKETER_BY_NIN,
  GET_MARKETER_BY_REFERRAL_CODE,
  GET_MARKETER_BY_VERIFICATION_TOKEN,
  GET_MARKETER_BY_UUID,
  GET_MARKETER_BY_ID_NUMBER,
  CREATE_NEW_MARKETER,
  UPDATE_MARKETER_BY_ID,
  DELETE_MARKETER_BY_ID,
  VERIFY_PHONE_NUMBER,
  VERIFY_EMAIL,
} = require("./queries/marketers.queries");

exports.getAllMarketers = async () => {
  return query(GET_ALL_MARKETERS);
};

exports.getMarketerById = async (id) => {
  const rows = await query(GET_MARKETER_BY_ID, [id]);
  return rows[0];
};
exports.getMarketerByEmail = async (email) => {
  const rows = await query(GET_MARKETER_BY_EMAIL, [email]);
  return rows[0];
};
exports.getMarketerByPhone = async (phone) => {
  const rows = await query(GET_MARKETER_BY_PHONE, [phone]);
  return rows[0];
};
exports.getMarketerByNin = async (nin) => {
  const rows = await query(GET_MARKETER_BY_NIN, [nin]);
  return rows[0];
};
exports.getMarketerByReferralCode = async (referralCode) => {
  const rows = await query(GET_MARKETER_BY_REFERRAL_CODE, [referralCode]);
  return rows[0];
};
exports.getMarketerByVerficationToken = async (token) => {
  const rows = await query(GET_MARKETER_BY_VERIFICATION_TOKEN, [token, token]);
  return rows[0];
};
exports.getMarketerByUuid = async (uuid) => {
  const rows = await query(GET_MARKETER_BY_UUID, [uuid]);
  return rows[0];
};
exports.getMarketerByIdNumber = async (idNumber) => {
  const rows = await query(GET_MARKETER_BY_ID_NUMBER, [idNumber]);
  return rows[0];
};

exports.createNewMarketer = async ({
  uuid,
  referralCode,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
  phoneNumber,
  verificationToken,
  email,
  emailToken,
  homeAddress,
  idDocumentType,
  idDocumentUuid,
  idDocumentNumber,
  nin,
  firstEmergencyContactName,
  firstEmergencyContactNumber,
  firstEmergencyContactAddress,
  secondEmergencyContactName,
  secondEmergencyContactNumber,
  secondEmergencyContactAddress,
}) => {
  return query(CREATE_NEW_MARKETER, [
    uuid,
    referralCode,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    phoneNumber,
    verificationToken,
    email,
    emailToken,
    homeAddress,
    idDocumentType,
    idDocumentNumber,
    idDocumentUuid,
    nin,
    firstEmergencyContactName,
    firstEmergencyContactNumber,
    firstEmergencyContactAddress,
    secondEmergencyContactName,
    secondEmergencyContactNumber,
    secondEmergencyContactAddress,
  ]);
};

exports.updateMarketerById = async ({
  marketerId,
  firstName,
  middleName,
  lastName,
  gender,
  dateOfBirth,
  phoneNumber,
  email,
  homeAddress,
  idDocumentType,
  idDocument,
  idDocumentNumber,
  nin,
  firstEmergencyContactName,
  firstEmergencyContactNumber,
  firstEmergencyContactAddress,
  secondEmergencyContactName,
  secondEmergencyContactNumber,
  secondEmergencyContacAddress,
}) => {
  return query(UPDATE_MARKETER_BY_ID, [
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    phoneNumber,
    email,
    homeAddress,
    idDocumentType,
    idDocument,
    idDocumentNumber,
    nin,
    firstEmergencyContactName,
    firstEmergencyContactNumber,
    firstEmergencyContactAddress,
    secondEmergencyContactName,
    secondEmergencyContactNumber,
    secondEmergencyContacAddress,
    marketerId,
  ]);
};

exports.verifyMarketerPhoneById = async ({
  marketerId,
  verifiedAt,
  phoneNumber,
}) => {
  return query(VERIFY_PHONE_NUMBER, [verifiedAt, marketerId, phoneNumber]);
};
exports.verifyMarketerEmailById = async ({ marketerId, verifiedAt, email }) => {
  return query(VERIFY_EMAIL, [verifiedAt, marketerId, email]);
};

exports.deleteMarketerById = async (id) => {
  const rows = await query(DELETE_MARKETER_BY_ID, [id]);
  return rows[0];
};
