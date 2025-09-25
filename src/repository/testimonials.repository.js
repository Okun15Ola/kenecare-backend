const { query } = require("./db.connection");
const queries = require("./queries/testimonials.queries");

exports.getAllTestimonials = async (limit, offset) => {
  return query(queries.GET_ALL_TESTIMONIALS, [offset, limit]);
};

exports.countTestimonial = async () => {
  const result = await query(queries.COUNT_TESTIMONIALS);
  return result[0];
};

exports.getTestimonialById = async (testimonialId) => {
  const result = await query(queries.GET_TESTIMONIAL_BY_ID, [testimonialId]);
  return result[0];
};

exports.getTestimonialByPatientId = async (patientId) => {
  const result = await query(queries.GET_TESTIMONIAL_BY_PATIENT_ID, [
    patientId,
  ]);
  return result[0];
};

exports.createNewTestimonial = async ({ patientId, content }) => {
  return query(queries.CREATE_TESTIMONIAL, [patientId, content]);
};

exports.updateTestimonialById = async ({
  testimonialId,
  patientId,
  content,
}) => {
  return query(queries.UPDATE_TESTIMONIAL_BY_ID, [
    content,
    testimonialId,
    patientId,
  ]);
};

exports.approveTestimonialById = async ({ testimonialId, approvedBy }) => {
  return query(queries.APPROVE_TESTIMONIAL_BY_ID, [approvedBy, testimonialId]);
};

exports.denyTestimonialById = async ({ testimonialId, approvedBy }) => {
  return query(queries.DENY_TESTIMONIAL_BY_ID, [approvedBy, testimonialId]);
};

exports.deleteTestimonialById = async (testimonialId) => {
  return query(queries.DELETE_TESTIMONIAL_BY_ID, [testimonialId]);
};
