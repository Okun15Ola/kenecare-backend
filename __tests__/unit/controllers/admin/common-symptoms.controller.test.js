jest.mock("../../../../src/services/common-symptoms.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/common-symptoms.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../../src/controllers/admin/common-symptoms.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("CommonSymptoms Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GetCommonSymptomsController", () => {
    it("should return symptoms with correct status", async () => {
      const res = mockRes();
      const req = {};
      const response = { statusCode: 200, data: ["symptom1"] };
      services.getCommonSymptoms.mockResolvedValue(response);

      await GetCommonSymptomsController(req, res, mockNext);

      expect(services.getCommonSymptoms).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {};
      const error = new Error("fail");
      services.getCommonSymptoms.mockRejectedValue(error);

      await GetCommonSymptomsController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCommonSymptomByIDController", () => {
    it("should return a symptom by id", async () => {
      const res = mockRes();
      const req = { params: { id: "5" } };
      const response = { statusCode: 200, data: { id: 5 } };
      services.getCommonSymptom.mockResolvedValue(response);

      await GetCommonSymptomByIDController(req, res, mockNext);

      expect(services.getCommonSymptom).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "5" } };
      const error = new Error("fail");
      services.getCommonSymptom.mockRejectedValue(error);

      await GetCommonSymptomByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateCommonSymptomController", () => {
    it("should create a symptom", async () => {
      const res = mockRes();
      const req = {
        user: { id: "2" },
        body: {
          name: "Headache",
          description: "Pain in head",
          specialtyId: 1,
          tags: ["pain"],
          consultationFee: 100,
        },
        file: { filename: "file.png" },
      };
      const response = { statusCode: 201, data: { id: 1 } };
      services.createCommonSymptom.mockResolvedValue(response);

      await CreateCommonSymptomController(req, res, mockNext);

      expect(services.createCommonSymptom).toHaveBeenCalledWith({
        name: "Headache",
        description: "Pain in head",
        specialtyId: 1,
        file: { filename: "file.png" },
        consultationFee: 100,
        tags: ["pain"],
        inputtedBy: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { user: { id: "2" }, body: {} };
      const error = new Error("fail");
      services.createCommonSymptom.mockRejectedValue(error);

      await CreateCommonSymptomController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateCommonSymptomByIdController", () => {
    it("should update a symptom", async () => {
      const res = mockRes();
      const req = {
        user: { id: "3" },
        params: { id: "7" },
        body: {
          name: "Cough",
          description: "Dry cough",
          specialtyId: 2,
          tags: ["respiratory"],
          consultationFee: 50,
        },
        file: undefined,
      };
      const response = { statusCode: 200, data: { id: 7 } };
      services.updateCommonSymptom.mockResolvedValue(response);

      await UpdateCommonSymptomByIdController(req, res, mockNext);

      expect(services.updateCommonSymptom).toHaveBeenCalledWith({
        id: 7,
        name: "Cough",
        description: "Dry cough",
        specialtyId: 2,
        file: undefined,
        consultationFee: 50,
        tags: ["respiratory"],
        inputtedBy: 3,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { user: { id: "3" }, params: { id: "7" }, body: {} };
      const error = new Error("fail");
      services.updateCommonSymptom.mockRejectedValue(error);

      await UpdateCommonSymptomByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateCommonSymptomStatusController", () => {
    it("should update symptom status", async () => {
      const res = mockRes();
      const req = {
        user: { id: "4" },
        params: { id: "8" },
        body: {
          name: "Fever",
          description: "High temperature",
          specialtyId: 3,
          tags: ["infection"],
          consultationFee: 120,
        },
        file: null,
      };
      const response = { statusCode: 200, data: { id: 8 } };
      services.updateCommonSymptom.mockResolvedValue(response);

      await UpdateCommonSymptomStatusController(req, res, mockNext);

      expect(services.updateCommonSymptom).toHaveBeenCalledWith({
        id: 8,
        name: "Fever",
        description: "High temperature",
        specialtyId: 3,
        file: null,
        consultationFee: 120,
        tags: ["infection"],
        inputtedBy: 4,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { user: { id: "4" }, params: { id: "8" }, body: {} };
      const error = new Error("fail");
      services.updateCommonSymptom.mockRejectedValue(error);

      await UpdateCommonSymptomStatusController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteCommonSymptomByIdController", () => {
    it("should delete a symptom (calls updateCommonSymptom)", async () => {
      const res = mockRes();
      const req = {
        user: { id: "5" },
        params: { id: "9" },
        body: {
          name: "Nausea",
          description: "Feeling sick",
          specialtyId: 4,
          tags: ["digestive"],
          consultationFee: 80,
        },
        file: undefined,
      };
      const response = { statusCode: 200, data: { id: 9 } };
      services.updateCommonSymptom.mockResolvedValue(response);

      await DeleteCommonSymptomByIdController(req, res, mockNext);

      expect(services.updateCommonSymptom).toHaveBeenCalledWith({
        id: 9,
        name: "Nausea",
        description: "Feeling sick",
        specialtyId: 4,
        file: undefined,
        consultationFee: 80,
        tags: ["digestive"],
        inputtedBy: 5,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { user: { id: "5" }, params: { id: "9" }, body: {} };
      const error = new Error("fail");
      services.updateCommonSymptom.mockRejectedValue(error);

      await DeleteCommonSymptomByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
