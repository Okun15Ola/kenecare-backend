module.exports = {
  getAllMedicalCouncils: jest.fn(),
  getMedicalCouncilById: jest.fn(),
  getMedicalCouncilByEmail: jest.fn(),
  getMedicalCouncilByMobileNumber: jest.fn(),
  createNewMedicalCouncil: jest.fn().mockResolvedValue({ insertId: 1 }),
  updateMedicalCouncilById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
  updateMedicalCouncilStatusById: jest
    .fn()
    .mockResolvedValue({ affectedRows: 1 }),
  deleteMedicalCouncilById: jest.fn().mockResolvedValue({ affectedRows: 1 }),
};
