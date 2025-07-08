jest.mock(
  "../../../../src/services/admin/doctor-council-registration.services",
);
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/admin/doctor-council-registration.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetCouncilRegistrationController,
  GetCouncilRegistrationByIdController,
  ApproveCouncilRegistrationController,
  RejectCouncilRegistrationController,
} = require("../../../../src/controllers/admin/doctors.council-registration.controller");

describe("Doctors Council Registration Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetCouncilRegistrationController", () => {
    it("should return all council registrations", async () => {
      const mockResponse = { statusCode: 200, data: [] };
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      services.getAllCouncilRegistrations.mockResolvedValue(mockResponse);

      await GetCouncilRegistrationController(req, res, next);

      expect(services.getAllCouncilRegistrations).toHaveBeenCalledWith(
        req.pagination.limit,
        req.pagination.offset,
        req.paginationInfo,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      services.getAllCouncilRegistrations.mockRejectedValue(error);

      await GetCouncilRegistrationController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCouncilRegistrationByIdController", () => {
    it("should return council registration by id", async () => {
      req.params.id = "123";
      const mockResponse = { statusCode: 200, data: { id: 123 } };
      services.getCouncilRegistration.mockResolvedValue(mockResponse);

      await GetCouncilRegistrationByIdController(req, res, next);

      expect(services.getCouncilRegistration).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "123";
      const error = new Error("Test error");
      services.getCouncilRegistration.mockRejectedValue(error);

      await GetCouncilRegistrationByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("ApproveCouncilRegistrationController", () => {
    it("should approve council registration", async () => {
      req.user.id = "42";
      req.params.id = "99";
      const mockResponse = { statusCode: 200, data: { approved: true } };
      services.approveCouncilRegistration.mockResolvedValue(mockResponse);

      await ApproveCouncilRegistrationController(req, res, next);

      expect(services.approveCouncilRegistration).toHaveBeenCalledWith({
        regId: 99,
        userId: 42,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.user.id = "42";
      req.params.id = "99";
      const error = new Error("Test error");
      services.approveCouncilRegistration.mockRejectedValue(error);

      await ApproveCouncilRegistrationController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("RejectCouncilRegistrationController", () => {
    it("should reject council registration", async () => {
      req.user.id = "7";
      req.params.id = "8";
      req.body.rejectionReason = "Incomplete documents";
      const mockResponse = { statusCode: 200, data: { rejected: true } };
      services.rejectCouncilRegistration.mockResolvedValue(mockResponse);

      await RejectCouncilRegistrationController(req, res, next);

      expect(services.rejectCouncilRegistration).toHaveBeenCalledWith({
        rejectionReason: "Incomplete documents",
        regId: 8,
        userId: 7,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.user.id = "7";
      req.params.id = "8";
      req.body.rejectionReason = "Incomplete documents";
      const error = new Error("Test error");
      services.rejectCouncilRegistration.mockRejectedValue(error);

      await RejectCouncilRegistrationController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
