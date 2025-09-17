const { query } = require("./db.connection");
const queries = require("./queries/doctorReviews.queries");

exports.addDoctorReview = async (patientId, doctorId, review) => {
  return query(queries.ADD_DOCTOR_REVIEW, [doctorId, patientId, review]);
};

exports.getDoctorReviews = async (limit, offset) => {
  const optimizedQuery = `${queries.GET_DOCTOR_REVIEWS} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery);
};

exports.getDoctorReviewsByPatientId = async (patientId) => {
  return query(queries.GET_DOCTOR_REVIEW_BY_PATIENT_ID, [patientId]);
};

exports.getApprovedDoctorReviewsByDoctorId = async (
  doctorId,
  limit,
  offset,
) => {
  const optimizedQuery = `${queries.GET_APPROVED_DOCTOR_REVIEW_BY_DOCTOR_ID} LIMIT ${limit} OFFSET ${offset}`;
  return query(optimizedQuery, [doctorId]);
};

exports.countDoctorApprovedReviews = async (doctorId) => {
  const row = await query(queries.COUNT_APPROVED_DOCTOR_REVIEW_BY_DOCTOR_ID, [
    doctorId,
  ]);
  return row[0];
};

exports.updateReviewApprovalStatus = async (reviewId, isApproved) => {
  return query(queries.UPDATE_REVIEW_APPROVAL_STATUS, [isApproved, reviewId]);
};

exports.getReviewById = async (reviewId) => {
  const row = await query(queries.GET_REVIEW_BY_ID, [reviewId]);
  return row[0];
};

exports.countDoctorsReviews = async () => {
  const row = await query(queries.COUNT_REVIEWS);
  return row[0];
};
