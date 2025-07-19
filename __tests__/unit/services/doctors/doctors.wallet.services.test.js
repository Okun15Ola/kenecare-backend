const doctorsWalletServices = require("../../../../src/services/doctors/doctors.wallet.services");
const doctorsRepository = require("../../../../src/repository/doctors.repository");
const doctorWalletRepository = require("../../../../src/repository/doctor-wallet.repository");
const Response = require("../../../../src/utils/response.utils");
const authUtils = require("../../../../src/utils/auth.utils");
const emailUtils = require("../../../../src/utils/email.utils");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/doctor-wallet.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/utils/auth.utils");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("doctors.wallet.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorsWallet", () => {
    it("should return NOT_FOUND if doctor does not exist", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await doctorsWalletServices.getDoctorsWallet(1);

      expect(doctorsRepository.getDoctorByUserId).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith(
        "Doctor not found for userId: 1",
      );
      expect(result).toBe("not_found");
    });

    it("should create wallet if not found and return SUCCESS", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue({ doctor_id: 2 });
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(null);
      authUtils.hashUsersPassword.mockResolvedValue("hashedPin");
      doctorWalletRepository.createDoctorWallet.mockResolvedValue({
        insertid: 5,
      });
      doctorWalletRepository.getWalletById.mockResolvedValue({
        first_name: "John",
        last_name: "Doe",
        balance: "100.50",
      });
      Response.SUCCESS.mockReturnValue("success");

      const result = await doctorsWalletServices.getDoctorsWallet(2);

      expect(authUtils.hashUsersPassword).toHaveBeenCalledWith("1234");
      expect(doctorWalletRepository.createDoctorWallet).toHaveBeenCalledWith({
        doctorId: 2,
        pin: "hashedPin",
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: {
          id: 2,
          doctorName: "John Doe",
          balance: 100.5,
        },
      });
      expect(result).toBe("success");
    });

    it("should return wallet info if wallet exists", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue({ doctor_id: 3 });
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue({
        first_name: "Jane",
        last_name: "Smith",
        balance: "200.00",
      });
      Response.SUCCESS.mockReturnValue("success");

      const result = await doctorsWalletServices.getDoctorsWallet(3);

      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: {
          id: 3,
          doctorName: "Jane Smith",
          balance: 200.0,
        },
      });
      expect(result).toBe("success");
    });

    it("should log and throw error on exception", async () => {
      doctorsRepository.getDoctorByUserId.mockRejectedValue(new Error("fail"));
      await expect(doctorsWalletServices.getDoctorsWallet(4)).rejects.toThrow(
        "fail",
      );
      expect(logger.error).toHaveBeenCalledWith(
        "getDoctorsWallet: ",
        expect.any(Error),
      );
    });
  });

  describe("updateDoctorWalletPin", () => {
    it("should return NOT_FOUND if doctor does not exist", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await doctorsWalletServices.updateDoctorWalletPin({
        userId: 1,
        newPin: "4321",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Doctor not found for userId: 1",
      );
      expect(result).toBe("not_found");
    });

    it("should update pin if wallet exists", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue({ doctor_id: 2 });
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue({
        doctor_id: 2,
      });
      authUtils.hashUsersPassword.mockResolvedValue("hashedPin");
      doctorWalletRepository.updateWalletPin.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await doctorsWalletServices.updateDoctorWalletPin({
        userId: 2,
        newPin: "5678",
      });

      expect(doctorWalletRepository.updateWalletPin).toHaveBeenCalledWith({
        doctorId: 2,
        pin: "hashedPin",
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Wallet Pin Updated Successfully",
      });
      expect(result).toBe("success");
    });

    it("should create wallet if wallet does not exist", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue({ doctor_id: 3 });
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(null);
      authUtils.hashUsersPassword.mockResolvedValue("hashedPin");
      doctorWalletRepository.createDoctorWallet.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");

      const result = await doctorsWalletServices.updateDoctorWalletPin({
        userId: 3,
        newPin: "9999",
      });

      expect(doctorWalletRepository.createDoctorWallet).toHaveBeenCalledWith({
        doctorId: 3,
        pin: "hashedPin",
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Wallet Pin Updated Successfully",
      });
      expect(result).toBe("success");
    });

    it("should log and throw error on exception", async () => {
      doctorsRepository.getDoctorByUserId.mockRejectedValue(new Error("fail"));
      await expect(
        doctorsWalletServices.updateDoctorWalletPin({
          userId: 4,
          newPin: "1111",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalledWith(
        "updateDoctorWalletPin: ",
        expect.any(Error),
      );
    });
  });

  describe("requestWithdrawal", () => {
    const doctor = {
      doctor_id: 1,
      first_name: "John",
      last_name: "Doe",
    };
    const wallet = { balance: "100.00" };

    it("should return NOT_FOUND if doctor does not exist", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Doctor not found for userId: 1",
      );
      expect(result).toBe("not_found");
    });

    it("should return BAD_REQUEST if wallet does not exist", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(null);
      Response.BAD_REQUEST.mockReturnValue("bad_request");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Doctor's wallet not found for doctorId: 1",
      );
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if insufficient balance", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue({
        balance: "10.00",
      });
      Response.BAD_REQUEST.mockReturnValue("bad_request");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Insufficient balance for doctorId: 1. Requested: 50, Available: 10",
      );
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if there is a pending withdrawal request", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(wallet);
      doctorWalletRepository.getWithdrawalRequestByDoctorId.mockResolvedValue({
        id: 123,
      });
      Response.BAD_REQUEST.mockReturnValue("bad_request");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Pending withdrawal request found for doctorId: 1. Cannot request another withdrawal.",
      );
      expect(result).toBe("bad_request");
    });

    it("should return BAD_REQUEST if exceeded daily maximum withdrawal requests", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(wallet);
      doctorWalletRepository.getWithdrawalRequestByDoctorId.mockResolvedValue(
        null,
      );
      doctorWalletRepository.getWithdrawalRequestByDoctorIdAndDate.mockResolvedValue(
        [{}, {}, {}],
      );
      Response.BAD_REQUEST.mockReturnValue("bad_request");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Exceeded daily maximum withdrawal requests for doctorId: 1. Requests today: 3",
      );
      expect(result).toBe("bad_request");
    });

    it("should create withdrawal request and send email, then return CREATED", async () => {
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      doctorWalletRepository.getWalletByDoctorId.mockResolvedValue(wallet);
      doctorWalletRepository.getWithdrawalRequestByDoctorId.mockResolvedValue(
        null,
      );
      doctorWalletRepository.getWithdrawalRequestByDoctorIdAndDate.mockResolvedValue(
        [],
      );
      doctorWalletRepository.createWithDrawalRequest.mockResolvedValue();
      emailUtils.adminWithdrawalRequestEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue("created");

      const result = await doctorsWalletServices.requestWithdrawal({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
        mobileMoneyNumber: "123456789",
        bankName: "Test Bank",
        accountName: "John Doe",
        accountNumber: "987654321",
      });

      expect(
        doctorWalletRepository.createWithDrawalRequest,
      ).toHaveBeenCalledWith({
        doctorId: 1,
        amount: 50,
        paymentMethod: "bank",
        mobileMoneyNumber: "123456789",
        bankName: "Test Bank",
        accountName: "John Doe",
        accountNumber: "987654321",
      });
      expect(emailUtils.adminWithdrawalRequestEmail).toHaveBeenCalledWith({
        doctorName: "John Doe",
        amount: 50,
        paymentMethod: "bank",
        mobileMoneyNumber: "123456789",
        bankName: "Test Bank",
        accountName: "John Doe",
        accountNumber: "987654321",
      });
      expect(Response.CREATED).toHaveBeenCalledWith({
        message: "Withdrawal Requested Successfully, Awaiting Approval",
      });
      expect(result).toBe("created");
    });

    it("should log and throw error on exception", async () => {
      doctorsRepository.getDoctorByUserId.mockRejectedValue(new Error("fail"));
      await expect(
        doctorsWalletServices.requestWithdrawal({
          userId: 1,
          amount: 50,
          paymentMethod: "bank",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalledWith(
        "requestWithdrawal: ",
        expect.any(Error),
      );
    });
  });
});
