const doctorsWalletService = require("../../../../src/services/doctors/doctors.wallet.services");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const doctorWalletRepo = require("../../../../src/repository/doctor-wallet.repository");
const authUtils = require("../../../../src/utils/auth.utils");
const emailUtils = require("../../../../src/utils/email.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/doctor-wallet.repository");
jest.mock("../../../../src/utils/auth.utils");
jest.mock("../../../../src/utils/email.utils");

describe("Doctors Wallet Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorsWallet", () => {
    it("should return a doctor wallet", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue({ balance: 100 });

      const result = await doctorsWalletService.getDoctorsWallet(1);
      expect(result.data.balance).toBe(100);
    });

    it("should create a new wallet if one does not exist", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue(null);
      authUtils.hashUsersPassword.mockResolvedValue("hashed_pin");
      doctorWalletRepo.createDoctorWallet.mockResolvedValue({ insertId: 1 });
      doctorWalletRepo.getWalletById.mockResolvedValue({ balance: 0 });

      const result = await doctorsWalletService.getDoctorsWallet(1);
      expect(result.data.balance).toBe(0);
    });
  });

  describe("updateDoctorWalletPin", () => {
    it("should update the wallet pin", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue({ id: 1 });
      authUtils.hashUsersPassword.mockResolvedValue("new_hashed_pin");
      doctorWalletRepo.updateWalletPin.mockResolvedValue({});

      const result = await doctorsWalletService.updateDoctorWalletPin({
        userId: 1,
        newPin: "4321",
      });
      expect(result.statusCode).toBe(200);
    });

    it("should create a new wallet if one does not exist", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue(null);
      authUtils.hashUsersPassword.mockResolvedValue("new_hashed_pin");
      doctorWalletRepo.createDoctorWallet.mockResolvedValue({});

      const result = await doctorsWalletService.updateDoctorWalletPin({
        userId: 1,
        newPin: "4321",
      });
      expect(result.statusCode).toBe(200);
    });
  });

  describe("requestWithdrawal", () => {
    it("should create a withdrawal request", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue({ balance: 200 });
      doctorWalletRepo.getWithdrawalRequestByDoctorId.mockResolvedValue(null);
      doctorWalletRepo.getWithdrawalRequestByDoctorIdAndDate.mockResolvedValue(
        [],
      );
      doctorWalletRepo.createWithDrawalRequest.mockResolvedValue({});
      emailUtils.adminWithdrawalRequestEmail.mockResolvedValue({});

      const result = await doctorsWalletService.requestWithdrawal({
        userId: 1,
        amount: 100,
      });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 for insufficient balance", async () => {
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      doctorWalletRepo.getWalletByDoctorId.mockResolvedValue({ balance: 50 });

      const result = await doctorsWalletService.requestWithdrawal({
        userId: 1,
        amount: 100,
      });
      expect(result.statusCode).toBe(400);
    });
  });
});
