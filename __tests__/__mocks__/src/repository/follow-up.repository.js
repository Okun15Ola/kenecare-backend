module.exports = {
  createNewFollowUp: jest.fn().mockResolvedValue({ insertId: 1 }),
  getAppointmentFollowUps: jest.fn(),
  getFollowUpById: jest.fn(),
  getDoctorFollowUpById: jest.fn(),
  getFollowByDateAndTime: jest.fn(),
  getDoctorsFollowByDateAndTime: jest.fn(),
  deleteAppointmentFollowUp: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  updateAppointmentFollowUp: jest.fn().mockResolvedValue({ affectedRows: 1 }),
};
