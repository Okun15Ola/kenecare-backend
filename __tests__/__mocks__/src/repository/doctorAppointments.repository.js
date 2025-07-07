module.exports = {
  getAppointmentsByDoctorId: jest.fn(),
  getDoctorAppointmentById: jest.fn(),
  getAppointmentByMeetingId: jest.fn(),
  approveDoctorAppointmentById: jest.fn(),
  updateDoctorAppointmentMeetingId: jest.fn(),
  updateDoctorAppointmentStartTime: jest.fn(),
  updateDoctorAppointmentEndTime: jest.fn(),
  cancelDoctorAppointmentById: jest.fn(),
  postponeDoctorAppointmentById: jest.fn(),
  getDoctorAppointByDate: jest.fn(),
  getDoctorAppointByDateAndTime: jest.fn(),
  createNewZoomMeeting: jest.fn(),
};
