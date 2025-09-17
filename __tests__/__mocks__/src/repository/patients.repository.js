module.exports = {
  getAllPatients: jest.fn(),
  getPatientById: jest.fn(),
  getPatientByUserId: jest.fn(),
  getPatientsByCityId: jest.fn(),
  createPatient: jest.fn().mockResolvedValue({ insertId: 1 }),
  createPatientMedicalInfo: jest.fn().mockResolvedValue({ insertId: 1 }),
  getPatientMedicalInfoByPatientId: jest.fn(),
  updatePatientById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  updatePatientFirstAppointmentStatus: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
  updatePatientProfilePictureByUserId: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
  updatePatientMedicalHistory: jest.fn(),
};
