const withdrawalsService = require("../../../../src/services/admin/withdrawals.services");
const Response = require("../../../../src/utils/response.utils");
const withdrawalRepo = require("../../../../src/repository/withdrawal-requests.repository");
const doctorRepo = require("../../../../src/repository/doctors.repository");
const walletRepo = require("../../../../src/repository/doctor-wallet.repository");
const smsUtils = require("../../../../src/utils/sms.utils");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const cachingUtils = require("../../../../src/utils/caching.utils");
const { redisClient } = require("../../../../src/config/redis.config");

jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/repository/withdrawal-requests.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/doctor-wallet.repository");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/caching.utils");
jest.mock("../../../../src/config/redis.config", () => ({
  redisClient: { clearCacheByPattern: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("withdrawals.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest
      .spyOn(Response, "INTERNAL_SERVER_ERROR")
      .mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  describe("getAllRequests", () => {
    it("should return no withdrawal requests if totalRows is falsy", async () => {
      cachingUtils.getCachedCount.mockResolvedValue(0);
      const limit = 10;
      const page = 1;
      Response.SUCCESS.mockReturnValue("success");
      const result = await withdrawalsService.getAllRequests(limit, page);
      expect(result).toBe("success");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No withdrawal requests found",
        data: [],
      });
    });

    it("should return no withdrawal requests if rawData is empty", async () => {
      cachingUtils.getCachedCount.mockResolvedValue(5);
      withdrawalRepo.getAllWithdrawalRequests.mockResolvedValue([]);
      cachingUtils.getPaginationInfo.mockReturnValue({ total: 5 });
      const limit = 10;
      const page = 1;
      Response.SUCCESS.mockReturnValue("success");
      const result = await withdrawalsService.getAllRequests(limit, page);
      expect(result).toBe("success");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No withdrawal requests found",
        data: [],
      });
    });

    it("should return mapped withdrawal requests with pagination", async () => {
      cachingUtils.getCachedCount.mockResolvedValue(2);
      const rawData = [{ id: 1 }, { id: 2 }];
      withdrawalRepo.getAllWithdrawalRequests.mockResolvedValue(rawData);
      dbMapper.mapWithdawalRow.mockImplementation((row) => ({
        ...row,
        mapped: true,
      }));
      cachingUtils.getPaginationInfo.mockReturnValue({ total: 2, page: 1 });
      Response.SUCCESS.mockReturnValue("success");
      const result = await withdrawalsService.getAllRequests(2, 1);
      expect(result).toBe("success");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: [
          { id: 1, mapped: true },
          { id: 2, mapped: true },
        ],
        pagination: { total: 2, page: 1 },
      });
    });

    it("should throw error and log if exception occurs", async () => {
      const error = new Error("fail");
      cachingUtils.getCachedCount.mockRejectedValue(error);
      logger.error.mockReturnValue();
      await expect(withdrawalsService.getAllRequests(1, 1)).rejects.toThrow(
        error,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getRequestById", () => {
    it("should return NOT_FOUND if request not found", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      logger.warn.mockReturnValue();
      const result = await withdrawalsService.getRequestById(123);
      expect(result).toBe("not_found");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Withdrawal request not found",
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return SUCCESS with mapped data", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue({ id: 1 });
      dbMapper.mapWithdawalRow.mockReturnValue({ id: 1, mapped: true });
      Response.SUCCESS.mockReturnValue("success");
      const result = await withdrawalsService.getRequestById(1);
      expect(result).toBe("success");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { id: 1, mapped: true },
      });
    });

    it("should throw error and log if exception occurs", async () => {
      const error = new Error("fail");
      withdrawalRepo.getWithdrawalRequestById.mockRejectedValue(error);
      logger.error.mockReturnValue();
      await expect(withdrawalsService.getRequestById(1)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("approveRequest", () => {
    const baseRawData = {
      request_status: "pending",
      doctor_id: 10,
      requested_amount: "100.00",
    };
    const doctor = {
      first_name: "John",
      last_name: "Doe",
      mobile_number: "1234567890",
    };

    it("should return NOT_FOUND if request not found", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      logger.warn.mockReturnValue();
      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 2,
        comment: "ok",
      });
      expect(result).toBe("not_found");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Withdrawal Request Not Found",
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return NOT_MODIFIED if already approved", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue({
        ...baseRawData,
        request_status: "approved",
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 2,
        comment: "ok",
      });
      expect(result).toBe("not_modified");
      expect(Response.NOT_MODIFIED).toHaveBeenCalled();
    });

    it("should return BAD_REQUEST if insufficient wallet balance", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(baseRawData);
      walletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: "50.00",
      });
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      logger.warn.mockReturnValue();
      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 2,
        comment: "ok",
      });
      expect(result).toBe("bad_request");
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Insufficient Wallet Balance. Cannot Approve Withdrawal",
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should approve request and return SUCCESS", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(baseRawData);
      walletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: "200.00",
      });
      doctorRepo.getDoctorById.mockResolvedValue(doctor);
      walletRepo.updateDoctorWalletBalance.mockResolvedValue();
      withdrawalRepo.approveWithdrawalRequest.mockResolvedValue();
      smsUtils.withdrawalApprovedSMS.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      redisClient.clearCacheByPattern.mockResolvedValue();
      Promise.allSettled = jest
        .fn()
        .mockResolvedValue([
          { status: "fulfilled" },
          { status: "fulfilled" },
          { status: "fulfilled" },
        ]);
      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 2,
        comment: "ok",
      });
      expect(result).toBe("success");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Withdrawal Request Approved Successfully",
      });
      expect(redisClient.clearCacheByPattern).toHaveBeenCalledWith(
        "withdraw-requests:*",
      );
    });

    it("should return NOT_MODIFIED if any promise is rejected", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(baseRawData);
      walletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: "200.00",
      });
      doctorRepo.getDoctorById.mockResolvedValue(doctor);
      Promise.allSettled = jest
        .fn()
        .mockResolvedValue([
          { status: "fulfilled" },
          { status: "rejected", reason: "fail" },
          { status: "fulfilled" },
        ]);
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      logger.error.mockReturnValue();
      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 2,
        comment: "ok",
      });
      expect(result).toBe("not_modified");
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error and log if exception occurs", async () => {
      const error = new Error("fail");
      withdrawalRepo.getWithdrawalRequestById.mockRejectedValue(error);
      logger.error.mockReturnValue();
      await expect(
        withdrawalsService.approveRequest({
          requestId: 1,
          userId: 2,
          comment: "ok",
        }),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("denyRequest", () => {
    const baseRawData = {
      request_status: "pending",
      doctor_id: 10,
    };
    const doctor = {
      first_name: "John",
      last_name: "Doe",
      mobile_number: "1234567890",
    };

    it("should return NOT_FOUND if request not found", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      logger.warn.mockReturnValue();
      const result = await withdrawalsService.denyRequest({
        requestId: 1,
        userId: 2,
        comment: "no",
      });
      expect(result).toBe("not_found");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Withdrawal Request Not Found",
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should return NOT_MODIFIED if already declined or approved", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue({
        ...baseRawData,
        request_status: "declined",
      });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await withdrawalsService.denyRequest({
        requestId: 1,
        userId: 2,
        comment: "no",
      });
      expect(result).toBe("not_modified");
      expect(Response.NOT_MODIFIED).toHaveBeenCalled();

      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue({
        ...baseRawData,
        request_status: "approved",
      });
      const result2 = await withdrawalsService.denyRequest({
        requestId: 1,
        userId: 2,
        comment: "no",
      });
      expect(result2).toBe("not_modified");
    });

    it("should deny request and return SUCCESS", async () => {
      withdrawalRepo.getWithdrawalRequestById.mockResolvedValue(baseRawData);
      doctorRepo.getDoctorById.mockResolvedValue(doctor);
      withdrawalRepo.denyWithdrawalRequest.mockResolvedValue();
      smsUtils.withdrawalDeniedSMS.mockReturnValue();
      redisClient.clearCacheByPattern.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await withdrawalsService.denyRequest({
        requestId: 1,
        userId: 2,
        comment: "no",
      });
      expect(result).toBe("success");
      expect(withdrawalRepo.denyWithdrawalRequest).toHaveBeenCalledWith({
        adminId: 2,
        withdrawalId: 1,
        comment: "no",
      });
      expect(smsUtils.withdrawalDeniedSMS).toHaveBeenCalledWith({
        mobileNumber: doctor.mobile_number,
        doctorName: `${doctor.first_name} ${doctor.last_name}`,
        comment: "no",
      });
      expect(redisClient.clearCacheByPattern).toHaveBeenCalledWith(
        "withdraw-requests:*",
      );
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Withdrawal Request Declined Successfully",
      });
    });

    it("should throw error and log if exception occurs", async () => {
      const error = new Error("fail");
      withdrawalRepo.getWithdrawalRequestById.mockRejectedValue(error);
      logger.error.mockReturnValue();
      await expect(
        withdrawalsService.denyRequest({
          requestId: 1,
          userId: 2,
          comment: "no",
        }),
      ).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
