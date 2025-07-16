const patientDocumentsService = require("../../../../src/services/patients/patients.documents.services");
const patientDocsRepo = require("../../../../src/repository/patient-docs.repository");
const patientsRepo = require("../../../../src/repository/patients.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const awsS3 = require("../../../../src/utils/aws-s3.utils");

jest.mock("../../../../src/repository/patient-docs.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/aws-s3.utils");
jest.mock("../../../../src/utils/sms.utils");

describe("Patient Documents Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientMedicalDocuments", () => {
    it("should return medical documents from cache if available", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      const cachedData = [{ id: 1, documentTitle: "X-Ray" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await patientDocumentsService.getPatientMedicalDocuments(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("patient-documents-1:all");
    });

    it("should return a 404 if patient not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      const result =
        await patientDocumentsService.getPatientMedicalDocuments(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createPatientMedicalDocument", () => {
    it("should create a new medical document", async () => {
      const file = { buffer: "buffer", mimetype: "application/pdf" };
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      awsS3.uploadFileToS3Bucket.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });
      patientDocsRepo.createPatientMedicalDocument.mockResolvedValue({
        insertId: 1,
      });

      const result = await patientDocumentsService.createPatientMedicalDocument(
        { userId: 1, file },
      );
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if no file is provided", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      const result = await patientDocumentsService.createPatientMedicalDocument(
        { userId: 1, file: null },
      );
      expect(result.statusCode).toBe(400);
    });
  });

  describe("deletePatientMedicalDocument", () => {
    it("should delete a medical document", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientDocsRepo.getPatientMedicalDocumentByDocumentId.mockResolvedValue({
        document_uuid: "uuid",
      });
      awsS3.deleteFileFromS3Bucket.mockResolvedValue({});
      patientDocsRepo.deletePatientDocById.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await patientDocumentsService.deletePatientMedicalDocument(
        { userId: 1, documentId: 1 },
      );
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if document not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientDocsRepo.getPatientMedicalDocumentByDocumentId.mockResolvedValue(
        null,
      );

      const result = await patientDocumentsService.deletePatientMedicalDocument(
        { userId: 1, documentId: 1 },
      );
      expect(result.statusCode).toBe(404);
    });
  });
});
