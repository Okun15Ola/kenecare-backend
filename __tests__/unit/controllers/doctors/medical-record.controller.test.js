const services = require("../../../../src/services/doctors/doctors.documents.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAllSharedMedicalRecordsController,
  GetSharedMedicalRecordByIDController,
} = require("../../../../src/controllers/doctors/medical-record.controller");

jest.mock("../../../../src/services/doctors/doctors.documents.services");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("Doctor Medical Record Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAllSharedMedicalRecordsController", () => {
    it("should return all shared medical records", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      services.getDoctorSharedMedicalDocuments.mockResolvedValue(mockResponse);

      await GetAllSharedMedicalRecordsController(req, res, next);

      expect(services.getDoctorSharedMedicalDocuments).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorSharedMedicalDocuments.mockRejectedValue(error);

      await GetAllSharedMedicalRecordsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetSharedMedicalRecordByIDController", () => {
    it("should return shared medical record by id", async () => {
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.getDoctorSharedMedicalDocument.mockResolvedValue(mockResponse);

      await GetSharedMedicalRecordByIDController(req, res, next);

      expect(services.getDoctorSharedMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        sharedDocId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorSharedMedicalDocument.mockRejectedValue(error);

      await GetSharedMedicalRecordByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
