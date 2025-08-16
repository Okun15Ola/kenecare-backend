module.exports = {
  GET_ALL_TESTIMONIALS: `
    SELECT testimonial_id, first_name, last_name, profile_pic_url, testimonial_content, is_approved, is_active, fullname as 'approved_by'
    FROM patients_testimonial
    INNER JOIN patients ON patients_testimonial.patient_id = patients.patient_id
    LEFT JOIN admins ON patients_testimonial.approved_by = admins.admin_id
    WHERE is_approved = 1 AND is_active = 1
  `,
  COUNT_TESTIMONIALS:
    "SELECT COUNT(*) AS totalRows FROM patients_testimonial WHERE is_approved = 1 AND is_active = 1;",
  GET_TESTIMONIAL_BY_ID: `
    SELECT testimonial_id, first_name, last_name, profile_pic_url, testimonial_content, is_approved, is_active, fullname as 'approved_by'
    FROM patients_testimonial
    INNER JOIN patients ON patients_testimonial.patient_id = patients.patient_id
    LEFT JOIN admins ON patients_testimonial.approved_by = admins.admin_id
    WHERE testimonial_id = ? AND is_approved = 1 AND is_active = 1 LIMIT 1;
  `,
  CREATE_TESTIMONIAL: `
    INSERT INTO patients_testimonial (patient_id, testimonial_content)
    VALUES (?, ?);
  `,
  UPDATE_TESTIMONIAL_BY_ID: `
    UPDATE patients_testimonial SET testimonial_content = ? WHERE testimonial_id = ? AND patient_id = ?;
  `,
  APPROVE_TESTIMONIAL_BY_ID: `
    UPDATE patients_testimonial SET is_approved = 1, is_active = 1, approved_by = ? WHERE testimonial_id = ?;
  `,
  DENY_TESTIMONIAL_BY_ID: `
    UPDATE patients_testimonial SET is_approved = 0, is_active = 0, approved_by = ? WHERE testimonial_id = ?;
  `,
  DELETE_TESTIMONIAL_BY_ID: `
    DELETE FROM patients_testimonial WHERE testimonial_id = ?;
  `,
};
