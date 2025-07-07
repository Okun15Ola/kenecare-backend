module.exports = {
  getAllPatients: jest.fn(),
  getPatientById: jest.fn(),
  getPatientByUserId: jest.fn(),
  getPatientsByCityId: jest.fn(),
  createPatient: jest.fn(),
  createPatientMedicalInfo: jest.fn(),
  getPatientMedicalInfoByPatientId: jest.fn(),
  updatePatientById: jest.fn(),
  updatePatientFirstAppointmentStatus: jest.fn(),
  updatePatientProfilePictureByUserId: jest.fn(),
  updatePatientMedicalHistory: jest.fn(),
};
