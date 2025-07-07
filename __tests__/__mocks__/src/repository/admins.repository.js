module.exports = {
  getAllAdmins: jest.fn(),
  getAdminById: jest.fn(),
  getAdminByMobileNumber: jest.fn(),
  getAdminByEmail: jest.fn(),
  createNewAdmin: jest.fn(),
  updateAdminEmailById: jest.fn(),
  updateAdminMobileNumberById: jest.fn(),
  updateAdminAccountStatusById: jest.fn(),
  updateUserVerificationStatusById: jest.fn(),
  updateUserPasswordById: jest.fn(),
  deleteUserById: jest.fn(),
};
