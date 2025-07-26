// TODO @Mevizcode You can create a patient related constants here
module.exports = {
  CACHE_KEYS: {
    PATIENT_APPOINTMENT_CACHE_KEY_PATTERN: (patientId) =>
      `patients:${patientId}:appointments`,
    PATIENT_DOCUMENTS_CACHE_KEY_PATTERN: (patientId) =>
      `patients:${patientId}:documents`,
  },
};
