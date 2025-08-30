jest.mock("../../../../src/services/admin/withdrawals.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const withdrawalsServices = require("../../../../src/services/admin/withdrawals.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAllWithdrawalRequestsController,
  GetWithdrawalRequestByIdController,
} = require("../../../../src/controllers/admin/withdrawals.controller");

describe("Withdrawals Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAllWithdrawalRequestsController", () => {
    it("should return all withdrawal requests", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      const req = {
        query: { limit: 10, page: 1 },
      };

      withdrawalsServices.getAllRequests.mockResolvedValue(mockResponse);

      await GetAllWithdrawalRequestsController(req, res, next);

      expect(withdrawalsServices.getAllRequests).toHaveBeenCalledWith(
        req.query.limit,
        req.query.page,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const req = {
        query: { limit: 10, page: 1 },
      };

      withdrawalsServices.getAllRequests.mockRejectedValue(error);

      await GetAllWithdrawalRequestsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetWithdrawalRequestByIdController", () => {
    it("should return withdrawal request by id", async () => {
      req.params.id = "5";
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      withdrawalsServices.getRequestById.mockResolvedValue(mockResponse);

      await GetWithdrawalRequestByIdController(req, res, next);

      expect(withdrawalsServices.getRequestById).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "5";
      const error = new Error("Test error");
      withdrawalsServices.getRequestById.mockRejectedValue(error);

      await GetWithdrawalRequestByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
