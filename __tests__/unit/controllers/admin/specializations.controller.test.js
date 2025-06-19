jest.mock("../../../../src/services/admin/specializations.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/admin/specializations.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetSpecializationsController,
  GetSpecializationByIDController,
  CreateSpecializationController,
  UpdateSpecializationByIdController,
  UpdateSpecializationStatusController,
  DeleteSpecializationByIdController,
} = require("../../../../src/controllers/admin/specializations.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Specializations Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GetSpecializationsController", () => {
    it("should return specializations with correct status", async () => {
      const res = mockRes();
      const mockResponse = { statusCode: 200, data: [] };
      services.getSpecializations.mockResolvedValue(mockResponse);

      await GetSpecializationsController({}, res, mockNext);

      expect(services.getSpecializations).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const error = new Error("Test error");
      services.getSpecializations.mockRejectedValue(error);

      await GetSpecializationsController({}, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetSpecializationByIDController", () => {
    it("should return specialization by id", async () => {
      const res = mockRes();
      const req = { params: { id: "1" } };
      const mockResponse = { statusCode: 200, data: { id: 1 } };
      services.getSpecializationById.mockResolvedValue(mockResponse);

      await GetSpecializationByIDController(req, res, mockNext);

      expect(services.getSpecializationById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "1" } };
      const error = new Error("Test error");
      services.getSpecializationById.mockRejectedValue(error);

      await GetSpecializationByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateSpecializationController", () => {
    it("should create a specialization", async () => {
      const res = mockRes();
      const req = { body: { name: "Cardiology", description: "desc" } };
      const mockResponse = { statusCode: 201, data: { id: 1 } };
      services.createSpecialization.mockResolvedValue(mockResponse);

      await CreateSpecializationController(req, res, mockNext);

      expect(services.createSpecialization).toHaveBeenCalledWith({
        name: "Cardiology",
        description: "desc",
        imageUrl: "https://example.com/cardiology.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle file existence", async () => {
      const res = mockRes();
      const req = {
        body: { name: "Cardiology", description: "desc" },
        file: {},
      };
      const mockResponse = { statusCode: 201, data: { id: 1 } };
      services.createSpecialization.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await CreateSpecializationController(req, res, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith("File exist");
      consoleSpy.mockRestore();
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { body: { name: "Cardiology", description: "desc" } };
      const error = new Error("Test error");
      services.createSpecialization.mockRejectedValue(error);

      await CreateSpecializationController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateSpecializationByIdController", () => {
    it("should update a specialization", async () => {
      const res = mockRes();
      const req = {
        body: { name: "Cardiology", description: "desc" },
        params: { id: "2" },
      };
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.updateSpecialization.mockResolvedValue(mockResponse);

      await UpdateSpecializationByIdController(req, res, mockNext);

      expect(services.updateSpecialization).toHaveBeenCalledWith({
        specializationId: 2,
        specialization: {
          name: "Cardiology",
          description: "desc",
          imageUrl: "https://example.com/cardiology.jpg",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle file existence", async () => {
      const res = mockRes();
      const req = {
        body: { name: "Cardiology", description: "desc" },
        params: { id: "2" },
        file: {},
      };
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.updateSpecialization.mockResolvedValue(mockResponse);

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await UpdateSpecializationByIdController(req, res, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith("File exist");
      consoleSpy.mockRestore();
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        body: { name: "Cardiology", description: "desc" },
        params: { id: "2" },
      };
      const error = new Error("Test error");
      services.updateSpecialization.mockRejectedValue(error);

      await UpdateSpecializationByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateSpecializationStatusController", () => {
    it("should update specialization status", async () => {
      const res = mockRes();
      const req = { params: { id: "3" }, query: { status: "1" } };
      const mockResponse = { statusCode: 200, data: { id: 3, status: 1 } };
      services.updateSpecializationStatus.mockResolvedValue(mockResponse);

      await UpdateSpecializationStatusController(req, res, mockNext);

      expect(services.updateSpecializationStatus).toHaveBeenCalledWith({
        specializationId: 3,
        status: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "3" }, query: { status: "1" } };
      const error = new Error("Test error");
      services.updateSpecializationStatus.mockRejectedValue(error);

      await UpdateSpecializationStatusController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteSpecializationByIdController", () => {
    it("should delete specialization by id", async () => {
      const res = mockRes();
      const req = { params: { id: "4" } };
      const mockResponse = { statusCode: 200, data: { id: 4 } };
      services.deleteSpecialization.mockResolvedValue(mockResponse);

      await DeleteSpecializationByIdController(req, res, mockNext);

      expect(services.deleteSpecialization).toHaveBeenCalledWith(4);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "4" } };
      const error = new Error("Test error");
      services.deleteSpecialization.mockRejectedValue(error);

      await DeleteSpecializationByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
