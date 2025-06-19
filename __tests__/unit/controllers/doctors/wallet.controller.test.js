jest.mock("../../../../src/services/doctors/doctors.wallet.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/doctors/doctors.wallet.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetDoctorWalletController,
  UpdateWalletPinController,
  RequestWithdrawalController,
} = require("../../../../src/controllers/doctors/wallet.controller");

describe("Doctor Wallet Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetDoctorWalletController", () => {
    it("should return doctor wallet", async () => {
      const mockResponse = { statusCode: 200, data: { balance: 100 } };
      services.getDoctorsWallet.mockResolvedValue(mockResponse);

      await GetDoctorWalletController(req, res, next);

      expect(services.getDoctorsWallet).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorsWallet.mockRejectedValue(error);

      await GetDoctorWalletController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateWalletPinController", () => {
    it("should update wallet pin", async () => {
      req.body = { newPin: "1234" };
      const mockResponse = { statusCode: 200, data: { success: true } };
      services.updateDoctorWalletPin.mockResolvedValue(mockResponse);

      await UpdateWalletPinController(req, res, next);

      expect(services.updateDoctorWalletPin).toHaveBeenCalledWith({
        userId: 1,
        newPin: "1234",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updateDoctorWalletPin.mockRejectedValue(error);

      await UpdateWalletPinController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("RequestWithdrawalController", () => {
    it("should request withdrawal", async () => {
      req.body = {
        amount: "50",
        paymentMethod: "bank",
        mobileMoneyNumber: "",
        bankName: "Test Bank",
        accountName: "John Doe",
        accountNumber: "1234567890",
      };
      const mockResponse = { statusCode: 201, data: { id: 1 } };
      services.requestWithdrawal.mockResolvedValue(mockResponse);

      await RequestWithdrawalController(req, res, next);

      expect(services.requestWithdrawal).toHaveBeenCalledWith({
        userId: 1,
        amount: 50,
        paymentMethod: "bank",
        mobileMoneyNumber: "",
        bankName: "Test Bank",
        accountName: "John Doe",
        accountNumber: "1234567890",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.requestWithdrawal.mockRejectedValue(error);

      await RequestWithdrawalController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
