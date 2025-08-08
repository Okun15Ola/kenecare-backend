module.exports = {
  ADD_DOCTOR_REVIEW:
    "INSERT INTO doctor_feedbacks (doctor_id, patient_id, feedback_content) VALUES (?, ?, ?);",
  GET_DOCTOR_REVIEWS: "SELECT * FROM doctor_feedbacks ORDER BY created_at DESC",
  GET_DOCTOR_REVIEW_BY_PATIENT_ID:
    "SELECT * FROM doctor_feedbacks WHERE patient_id = ? ORDER BY created_at DESC",
  GET_APPROVED_DOCTOR_REVIEW_BY_DOCTOR_ID:
    "SELECT * FROM doctor_feedbacks WHERE doctor_id = ? AND is_feedback_approved = 1 ORDER BY created_at DESC",
  UPDATE_REVIEW_APPROVAL_STATUS:
    "UPDATE doctor_feedbacks SET is_feedback_approved = ? WHERE feedback_id = ?;",
  GET_REVIEW_BY_ID: "SELECT * FROM doctor_feedbacks WHERE feedback_id = ?;",
  COUNT_REVIEWS: "SELECT COUNT(*) as totalRows FROM doctor_feedbacks;",
};
