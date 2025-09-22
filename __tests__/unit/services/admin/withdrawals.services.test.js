const withdrawalsService = require("../../../../src/services/admin/withdrawals.services");
const Response = require("../../../../src/utils/response.utils");
const withdrawalRepo = require("../../../../src/repository/withdrawal-requests.repository");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const cachingUtils = require("../../../../src/utils/caching.utils");

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
  });

  describe("getWithdrawalRequestByTransactionId", () => {
    it("should return NOT_FOUND if request not found", async () => {
      withdrawalRepo.getWithdrawalRequestByTransactionId.mockResolvedValue(
        null,
      );
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
      withdrawalRepo.getWithdrawalRequestByTransactionId.mockResolvedValue({
        id: 1,
      });
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
      withdrawalRepo.getWithdrawalRequestByTransactionId.mockRejectedValue(
        error,
      );
      logger.error.mockReturnValue();
      await expect(withdrawalsService.getRequestById(1)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
