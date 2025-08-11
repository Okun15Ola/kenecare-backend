module.exports = {
  ADD_APPOINTMENT_FEEDBACK:
    "INSERT INTO appointment_feedbacks (appointment_id, feedback_content) VALUES (?, ?);",
  GET_APPOINTMENT_FEEDBACK:
    "SELECT * FROM appointment_feedbacks WHERE appointment_id = ?;",
};
