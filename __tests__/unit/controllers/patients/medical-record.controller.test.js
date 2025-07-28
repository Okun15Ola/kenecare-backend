jest.mock("../../../../src/services/patients/patients.documents.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/patients/patients.documents.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAllMedicalRecordsController,
  GetMedicalRecordByIDController,
  CreateMedicalRecordController,
  UpdateMedicalRecordByIdController,
  DeleteMedicalRecordByIdController,
  ShareMedicalDocumentController,
  GetAllSharedMedicalDocumentsController,
  GetSharedMedicalDocumentByIDController,
  UpdateSharedMedicalDocumentByIdController,
  DeleteSharedMedicalDocumentByIdController,
} = require("../../../../src/controllers/patients/medical-record.controller");

describe("Patient Medical Record Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
      body: { id: 1, password: "1234" },
      file: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAllMedicalRecordsController", () => {
    it("should return all medical records", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      services.getPatientMedicalDocuments.mockResolvedValue(mockResponse);

      await GetAllMedicalRecordsController(req, res, next);

      expect(services.getPatientMedicalDocuments).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientMedicalDocuments.mockRejectedValue(error);

      await GetAllMedicalRecordsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetMedicalRecordByIDController", () => {
    it("should return medical record by id", async () => {
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.getPatientMedicalDocument.mockResolvedValue(mockResponse);

      await GetMedicalRecordByIDController(req, res, next);

      expect(services.getPatientMedicalDocument).toHaveBeenCalledWith({
        docId: 1,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientMedicalDocument.mockRejectedValue(error);

      await GetMedicalRecordByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateMedicalRecordController", () => {
    it("should create a medical record", async () => {
      req.file = { buffer: Buffer.from("test") };
      req.body = { documentTitle: "Test Doc" };
      const mockResponse = { statusCode: 201, data: { id: 3 } };
      services.createPatientMedicalDocument.mockResolvedValue(mockResponse);

      await CreateMedicalRecordController(req, res, next);

      expect(services.createPatientMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        file: { buffer: Buffer.from("test") },
        documentTitle: "Test Doc",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createPatientMedicalDocument.mockRejectedValue(error);

      await CreateMedicalRecordController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateMedicalRecordByIdController", () => {
    it("should update a medical record", async () => {
      req.file = { buffer: Buffer.from("test2") };
      req.body = { documentTitle: "Updated Doc" };
      req.params.id = "5";
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      services.updatePatientMedicalDocument.mockResolvedValue(mockResponse);

      await UpdateMedicalRecordByIdController(req, res, next);

      expect(services.updatePatientMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        file: { buffer: Buffer.from("test2") },
        docId: 5,
        documentTitle: "Updated Doc",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updatePatientMedicalDocument.mockRejectedValue(error);

      await UpdateMedicalRecordByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteMedicalRecordByIdController", () => {
    it("should delete a medical record", async () => {
      req.body.id = "7";
      const mockResponse = { statusCode: 200, data: { id: 7 } };
      services.deletePatientMedicalDocument.mockResolvedValue(mockResponse);

      await DeleteMedicalRecordByIdController(req, res, next);

      expect(services.deletePatientMedicalDocument).toHaveBeenCalledWith({
        documentId: 7,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.deletePatientMedicalDocument.mockRejectedValue(error);

      await DeleteMedicalRecordByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("ShareMedicalDocumentController", () => {
    it("should share a medical document", async () => {
      req.body = { documentId: 8, doctorId: 2, note: "Share note" };
      const mockResponse = { statusCode: 201, data: { id: 8 } };
      services.createPatientSharedMedicalDocument.mockResolvedValue(
        mockResponse,
      );

      await ShareMedicalDocumentController(req, res, next);

      expect(services.createPatientSharedMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        documentId: 8,
        doctorId: 2,
        note: "Share note",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createPatientSharedMedicalDocument.mockRejectedValue(error);

      await ShareMedicalDocumentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAllSharedMedicalDocumentsController", () => {
    it("should return all shared medical documents", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 9 }] };
      services.getPatientSharedMedicalDocuments.mockResolvedValue(mockResponse);

      await GetAllSharedMedicalDocumentsController(req, res, next);

      expect(services.getPatientSharedMedicalDocuments).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientSharedMedicalDocuments.mockRejectedValue(error);

      await GetAllSharedMedicalDocumentsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetSharedMedicalDocumentByIDController", () => {
    it("should return shared medical document by id", async () => {
      req.params.id = "11";
      const mockResponse = { statusCode: 200, data: { id: 11 } };
      services.getPatientSharedMedicalDocument.mockResolvedValue(mockResponse);

      await GetSharedMedicalDocumentByIDController(req, res, next);

      expect(services.getPatientSharedMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        documentId: 11,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientSharedMedicalDocument.mockRejectedValue(error);

      await GetSharedMedicalDocumentByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateSharedMedicalDocumentByIdController", () => {
    it("should update shared medical document", async () => {
      req.body = { documentId: 12, doctorId: 3, note: "Update note" };
      const mockResponse = { statusCode: 200, data: { id: 12 } };
      services.createPatientSharedMedicalDocument.mockResolvedValue(
        mockResponse,
      );

      await UpdateSharedMedicalDocumentByIdController(req, res, next);

      expect(services.createPatientSharedMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        documentId: 12,
        doctorId: 3,
        note: "Update note",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createPatientSharedMedicalDocument.mockRejectedValue(error);

      await UpdateSharedMedicalDocumentByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteSharedMedicalDocumentByIdController", () => {
    it("should delete shared medical document", async () => {
      req.params.id = "13";
      const mockResponse = { statusCode: 200, data: { id: 13 } };
      services.deletePatientSharedMedicalDocument.mockResolvedValue(
        mockResponse,
      );

      await DeleteSharedMedicalDocumentByIdController(req, res, next);

      expect(services.deletePatientSharedMedicalDocument).toHaveBeenCalledWith({
        userId: 1,
        documentId: 13,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.deletePatientSharedMedicalDocument.mockRejectedValue(error);

      await DeleteSharedMedicalDocumentByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
