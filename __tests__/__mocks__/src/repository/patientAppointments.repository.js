module.exports = {
  getAllPatientAppointments: jest.fn(),
  getPatientAppointmentById: jest.fn(),
  getPatientAppointmentByUUID: jest.fn(),
  getAppointmentByUUID: jest.fn(),
  getAppointmentByID: jest.fn(),
  createNewPatientAppointment: jest.fn().mockResolvedValue({ insertId: 1 }),
  deleteAppointmentById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
};
