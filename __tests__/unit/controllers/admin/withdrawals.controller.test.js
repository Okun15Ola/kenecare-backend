const withdrawalsServices = require("../../../../src/services/admin/withdrawals.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAllWithdrawalRequestsController,
  GetWithdrawalRequestByIdController,
  ApproveWithdrawalRequestController,
  DenyWithdrawalRequestController,
} = require("../../../../src/controllers/admin/withdrawals.controller");

jest.mock("../../../../src/services/admin/withdrawals.services");
jest.mock("../../../../src/middlewares/logger.middleware");

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
      withdrawalsServices.getAllRequests.mockResolvedValue(mockResponse);

      await GetAllWithdrawalRequestsController(req, res, next);

      expect(withdrawalsServices.getAllRequests).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
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

  describe("ApproveWithdrawalRequestController", () => {
    it("should approve withdrawal request", async () => {
      req.params.id = "10";
      req.user.id = "2";
      req.body.comment = "Approved!";
      const mockResponse = {
        statusCode: 200,
        data: { id: 10, status: "approved" },
      };
      withdrawalsServices.approveRequest.mockResolvedValue(mockResponse);

      await ApproveWithdrawalRequestController(req, res, next);

      expect(withdrawalsServices.approveRequest).toHaveBeenCalledWith({
        requestId: 10,
        userId: 2,
        comment: "Approved!",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "10";
      req.user.id = "2";
      req.body.comment = "Approved!";
      const error = new Error("Test error");
      withdrawalsServices.approveRequest.mockRejectedValue(error);

      await ApproveWithdrawalRequestController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DenyWithdrawalRequestController", () => {
    it("should deny withdrawal request", async () => {
      req.params.id = "20";
      req.user.id = "3";
      req.body.comment = "Denied!";
      const mockResponse = {
        statusCode: 200,
        data: { id: 20, status: "denied" },
      };
      withdrawalsServices.denyRequest.mockResolvedValue(mockResponse);

      await DenyWithdrawalRequestController(req, res, next);

      expect(withdrawalsServices.denyRequest).toHaveBeenCalledWith({
        userId: 3,
        requestId: 20,
        comment: "Denied!",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "20";
      req.user.id = "3";
      req.body.comment = "Denied!";
      const error = new Error("Test error");
      withdrawalsServices.denyRequest.mockRejectedValue(error);

      await DenyWithdrawalRequestController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
