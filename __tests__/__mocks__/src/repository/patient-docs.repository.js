module.exports = {
  getAllPatientDocs: jest.fn(),
  getPatientMedicalDocumentById: jest.fn(),
  getPatientMedicalDocumentByDocumentId: jest.fn(),
  getMedicalDocumentsByPatientId: jest.fn(),
  createPatientMedicalDocument: jest.fn().mockResolvedValue({ insertId: 1 }),
  updatePatientMedicalDocumentById: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
  deletePatientDocById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  createPatientDocumentSharing: jest.fn().mockResolvedValue({ insertId: 1 }),
  getSharedMedicalDocumentByIdAndDoctorId: jest.fn(),
  getPatientSharedMedicalDocuments: jest.fn(),
  getSharedMedicalDocumentsByDoctorId: jest.fn(),
  getPatientSharedMedicalDocument: jest.fn(),
  getSharedMedicalDocumentById: jest.fn(),
  getDoctorSharedMedicalDocumentById: jest.fn(),
  updatePatientSharedMedicalDocument: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
  deletePatientSharedMedicalDocument: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
};
