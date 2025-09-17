module.exports = {
  CREATE_DOCTOR_FAQ:
    "INSERT INTO doctor_faqs(doctor_id, question, answer) VALUES(?, ?, ?);",
  UPDATE_DOCTOR_FAQ:
    "UPDATE doctor_faqs SET question = ?, answer = ? WHERE faq_id = ? AND doctor_id = ?;",
  UPDATE_DOCTOR_FAQ_STATUS:
    "UPDATE doctor_faqs SET is_active = ? WHERE faq_id = ? AND doctor_id = ?;",
  DELETE_DOCTOR_FAQ:
    "DELETE FROM doctor_faqs WHERE faq_id = ? AND doctor_id = ?;",
  GET_DOCTOR_FAQS:
    "SELECT faq_id AS faqId, doctor_id AS doctorId, answer, question FROM doctor_faqs WHERE doctor_id = ? ORDER BY created_at DESC",
  GET_DOCTOR_FAQ:
    "SELECT faq_id AS faqId, doctor_id AS doctorId, answer, question FROM doctor_faqs WHERE faq_id = ? AND doctor_id = ? LIMIT 1;",
  GET_FAQ_BY_ID:
    "SELECT faq_id, doctor_id, answer, question, created_at, updated_at FROM doctor_faqs WHERE faq_id = ?;",
  GET_ACTIVE_DOCTOR_FAQS:
    "SELECT faq_id AS faqId, doctor_id AS doctorId, answer, question FROM doctor_faqs WHERE doctor_id = ? AND is_active = 1 ORDER BY created_at DESC",
  COUNT_DOCTOR_FAQ:
    "SELECT COUNT(*) AS totalRows FROM doctor_faqs WHERE doctor_id = ?;",
  COUNT_DOCTOR_ACTIVE_FAQ:
    "SELECT COUNT(*) AS totalRows FROM doctor_faqs WHERE doctor_id = ? AND is_active = 1;",
};
