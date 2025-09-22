module.exports = {
  /**
   * Generates a comprehensive set of cache keys and patterns for a given appointment.
   * This centralizes all cache-related string logic to prevent stale data issues.
   *
   * @param {string} doctorId - The ID of the doctor.
   * @param {string} patientId - The ID of the patient.
   * @returns {object} An object containing keys and patterns for clearing the cache.
   */
  getAppointmentCacheKeys: (doctorId, patientId) => {
    const doctorAppointmentsPattern = `doctor:${doctorId}:appointments:*`;
    const patientAppointmentsPattern = `patient:${patientId}:appointments:*`;
    const adminAppointmentsPattern = "admin:appointments:*";
    // const doctorAppointmentsAllPattern = `doctor:${doctorId}:appointments:all:*`;

    return [
      doctorAppointmentsPattern,
      patientAppointmentsPattern,
      adminAppointmentsPattern,
      // doctorAppointmentsAllPattern,
    ];
  },
};
