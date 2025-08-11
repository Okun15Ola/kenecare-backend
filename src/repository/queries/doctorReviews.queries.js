module.exports = {
  ADD_DOCTOR_REVIEW:
    "INSERT INTO doctor_feedbacks (doctor_id, patient_id, feedback_content) VALUES (?, ?, ?);",
  GET_DOCTOR_REVIEWS: `
  SELECT 
    df.feedback_id,
    df.patient_id,
    p.first_name,
    p.last_name,
    df.doctor_id,
    d.last_name AS doctorName,
    df.feedback_content,
    df.is_feedback_approved,
    df.created_at,
    df.updated_at
  FROM doctor_feedbacks df
  INNER JOIN patients p ON p.patient_id = df.patient_id
  INNER JOIN doctors d ON d.doctor_id = df.doctor_id
  ORDER BY df.created_at DESC
  `,
  GET_DOCTOR_REVIEW_BY_PATIENT_ID: `
  SELECT 
    df.feedback_id,
    df.patient_id,
    p.first_name,
    p.last_name,
    df.doctor_id,
    d.last_name AS doctorName,
    df.feedback_content,
    df.is_feedback_approved,
    df.created_at,
    df.updated_at
  FROM doctor_feedbacks df
  INNER JOIN patients p ON p.patient_id = df.patient_id
  INNER JOIN doctors d ON d.doctor_id = df.doctor_id
  WHERE df.patient_id = ?
  ORDER BY df.created_at DESC
  `,
  GET_APPROVED_DOCTOR_REVIEW_BY_DOCTOR_ID:
    "SELECT df.feedback_id, df.patient_id, p.first_name, p.last_name, df.doctor_id, d.last_name AS doctorName, df.feedback_content, df.is_feedback_approved, df.created_at, df.updated_at FROM doctor_feedbacks df INNER JOIN patients p ON p.patient_id = df.patient_id INNER JOIN doctors d ON d.doctor_id = df.doctor_id WHERE df.doctor_id = ? AND is_feedback_approved = 1 ORDER BY created_at DESC",
  UPDATE_REVIEW_APPROVAL_STATUS:
    "UPDATE doctor_feedbacks SET is_feedback_approved = ? WHERE feedback_id = ?;",
  GET_REVIEW_BY_ID:
    "SELECT df.feedback_id, df.patient_id, p.first_name, p.last_name, df.doctor_id, d.last_name AS doctorName, df.feedback_content, df.is_feedback_approved, df.created_at, df.updated_at FROM doctor_feedbacks df INNER JOIN patients p ON p.patient_id = df.patient_id INNER JOIN doctors d ON d.doctor_id = df.doctor_id WHERE feedback_id = ?;",
  COUNT_REVIEWS: "SELECT COUNT(*) as totalRows FROM doctor_feedbacks;",
};
