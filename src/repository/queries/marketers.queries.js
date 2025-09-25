module.exports = {
  GET_ALL_MARKETERS:
    "SELECT m.*, COUNT(*) OVER() AS totalRows FROM marketers m LIMIT ?,?",
  COUNT_MARKETERS: "SELECT COUNT(*) as totalRows FROM marketers;",
  GET_MARKETER_BY_ID: "SELECT * FROM marketers WHERE marketer_id = ? LIMIT 1",
  GET_MARKETER_BY_UUID:
    "SELECT * FROM marketers WHERE marketer_uuid = ? LIMIT 1",
  GET_MARKETER_BY_PHONE:
    "SELECT * FROM marketers WHERE phone_number = ? LIMIT 1",
  GET_MARKETER_BY_EMAIL: "SELECT * FROM marketers WHERE email = ? LIMIT 1",
  GET_MARKETER_BY_NIN: "SELECT * FROM marketers WHERE nin = ? LIMIT 1",
  GET_MARKETER_BY_REFERRAL_CODE:
    "SELECT * FROM marketers WHERE referral_code = ? LIMIT 1",
  GET_MARKETER_BY_ID_NUMBER:
    "SELECT * FROM marketers WHERE id_document_number = ? LIMIT 1",
  GET_MARKETER_BY_VERIFICATION_TOKEN:
    "SELECT * FROM marketers WHERE phone_verification_token = ? LIMIT 1",
  GET_MARKETER_BY_EMAIL_VERIFICATION_TOKEN:
    "SELECT * FROM marketers WHERE  email_verification_token = ? LIMIT 1",
  GET_USERS_BY_MARKETER_REFERRAL_CODE:
    "SELECT * FROM users WHERE referral_code = ?",
  GET_TOTAL_USERS_REGISTERED_BY_MARKETER_REFERRAL_CODE:
    "SELECT COUNT(*) as 'total_registered' FROM users WHERE referral_code = ? AND is_verified = 1",
  CREATE_NEW_MARKETER:
    "INSERT INTO marketers (marketer_uuid,referral_code,first_name,middle_name,last_name,gender,dob,phone_number, phone_verification_token,email,email_verification_token,home_address, id_document_type, id_document_number, id_document_uuid, nin,emergency_contact_name_1,emergency_contact_phone_1,emergency_contact_address_1, emergency_contact_name_2,emergency_contact_phone_2, emergency_contact_address_2 ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
  UPDATE_MARKETER_BY_ID:
    "UPDATE marketers SET first_name = ?,middle_name = ?,last_name = ?,gender = ?,dob = ?,phone_number = ?, phone_verification_token = ?,email = ?,home_address = ?, id_document_type = ?, id_document_number = ?, id_document_uuid = ?, nin = ?,emergency_contact_name_1 = ?,emergency_contact_phone_1 = ?,emergency_contact_address_1 = ?, emergency_contact_name_2 = ?,emergency_contact_phone_2 = ?, emergency_contact_address_2 = ? WHERE marketer_id = ?",
  DELETE_MARKETER_BY_ID: "DELETE FROM marketers WHERE marketer_id = ? LIMIT 1",
  VERIFY_PHONE_NUMBER:
    "UPDATE marketers SET is_phone_verified = true, phone_verification_token = NULL, phone_verified_at = ? WHERE marketer_id = ? AND phone_number = ?",
  VERIFY_EMAIL:
    "UPDATE marketers SET is_email_verified = true, email_verification_token = NULL, email_verified_at = ? WHERE marketer_id = ? AND email = ?",
};
