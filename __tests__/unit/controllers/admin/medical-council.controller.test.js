jest.mock("../../../../src/services/medical-councils.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/medical-councils.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetMedicalCouncilsController,
  GetMedicalCouncilByIDController,
  CreateMedicalCouncilController,
  UpdateMedicalCouncilByIdController,
  UpdateMedicalCouncilStatusController,
  DeleteMedicalCouncilByIdController,
} = require("../../../../src/controllers/admin/medical-council.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Medical Council Controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GetMedicalCouncilsController", () => {
    it("should return medical councils with correct status", async () => {
      const res = mockRes();
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      const response = { statusCode: 200, data: [{ id: 1 }] };
      services.getMedicalCouncils.mockResolvedValue(response);

      await GetMedicalCouncilsController(req, res, mockNext);

      expect(services.getMedicalCouncils).toHaveBeenCalledWith(
        req.pagination.limit,
        req.pagination.offset,
        req.paginationInfo,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      const error = new Error("fail");
      services.getMedicalCouncils.mockRejectedValue(error);

      await GetMedicalCouncilsController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetMedicalCouncilByIDController", () => {
    it("should return a medical council by id", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const response = { statusCode: 200, data: { id: 2 } };
      services.getMedicalCouncil.mockResolvedValue(response);

      await GetMedicalCouncilByIDController(req, res, mockNext);

      expect(services.getMedicalCouncil).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const error = new Error("fail");
      services.getMedicalCouncil.mockRejectedValue(error);

      await GetMedicalCouncilByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateMedicalCouncilController", () => {
    it("should create a medical council", async () => {
      const res = mockRes();
      const req = {
        body: {
          name: "Test",
          email: "test@mail.com",
          mobileNumber: "1234567890",
          address: "Test Address",
        },
      };
      const response = { statusCode: 201, data: { id: 3 } };
      services.createMedicalCouncil.mockResolvedValue(response);

      await CreateMedicalCouncilController(req, res, mockNext);

      expect(services.createMedicalCouncil).toHaveBeenCalledWith({
        ...req.body,
        inputtedBy: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { body: {} };
      const error = new Error("fail");
      services.createMedicalCouncil.mockRejectedValue(error);

      await CreateMedicalCouncilController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateMedicalCouncilByIdController", () => {
    it("should update a medical council", async () => {
      const res = mockRes();
      const req = {
        params: { id: "4" },
        body: {
          name: "Updated",
          email: "updated@mail.com",
          mobileNumber: "0987654321",
          address: "Updated Address",
        },
      };
      const response = { statusCode: 200, data: { id: 4 } };
      services.updateMedicalCouncil.mockResolvedValue(response);

      await UpdateMedicalCouncilByIdController(req, res, mockNext);

      expect(services.updateMedicalCouncil).toHaveBeenCalledWith({
        id: 4,
        ...req.body,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "4" }, body: {} };
      const error = new Error("fail");
      services.updateMedicalCouncil.mockRejectedValue(error);

      await UpdateMedicalCouncilByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateMedicalCouncilStatusController", () => {
    it("should update medical council status", async () => {
      const res = mockRes();
      const req = { params: { id: "5" }, query: { status: "1" } };
      const response = { statusCode: 200, data: { id: 5, status: 1 } };
      services.updateMedicalCouncilStatus.mockResolvedValue(response);

      await UpdateMedicalCouncilStatusController(req, res, mockNext);

      expect(services.updateMedicalCouncilStatus).toHaveBeenCalledWith({
        id: 5,
        status: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "5" }, query: { status: "1" } };
      const error = new Error("fail");
      services.updateMedicalCouncilStatus.mockRejectedValue(error);

      await UpdateMedicalCouncilStatusController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteMedicalCouncilByIdController", () => {
    it("should delete a medical council", async () => {
      const res = mockRes();
      const req = { params: { id: "6" } };
      const response = { statusCode: 200, data: { id: 6 } };
      services.deleteMedicalCouncil.mockResolvedValue(response);

      await DeleteMedicalCouncilByIdController(req, res, mockNext);

      expect(services.deleteMedicalCouncil).toHaveBeenCalledWith(6);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "6" } };
      const error = new Error("fail");
      services.deleteMedicalCouncil.mockRejectedValue(error);

      await DeleteMedicalCouncilByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
