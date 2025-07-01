module.exports = {
  getWalletByDoctorId: jest.fn(),
  getWalletById: jest.fn(),
  updateWalletPin: jest.fn(),
  createDoctorWallet: jest.fn(),
  getCurrentWalletBalance: jest.fn(),
  updateDoctorWalletBalance: jest.fn(),
  getWithdrawalRequestByDoctorId: jest.fn(),
  getWithdrawalRequestByDoctorIdAndDate: jest.fn(),
  createWithDrawalRequest: jest.fn(),
};
