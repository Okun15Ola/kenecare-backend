const doctorsDocumentsService = require("../../../../src/services/doctors/doctors.documents.services");
const patientDocsRepo = require("../../../../src/repository/patient-docs.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const redisClient = require("../../../../src/config/redis.config");
// const dbMapper = require("../../../../src/utils/db-mapper.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/patient-docs.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("Doctors Documents Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorSharedMedicalDocuments", () => {
    it("should return shared documents from cache if available", async () => {
      const cachedData = [{ id: 1, documentName: "X-Ray" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await doctorsDocumentsService.getDoctorSharedMedicalDocuments(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "doctor-shared-medical-documents:1",
      );
    });

    it("should return a 404 if doctor not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue(null);

      const result =
        await doctorsDocumentsService.getDoctorSharedMedicalDocuments(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("getDoctorSharedMedicalDocument", () => {
    it("should return a shared document by id from cache if available", async () => {
      const cachedData = { id: 1, documentName: "X-Ray" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await doctorsDocumentsService.getDoctorSharedMedicalDocument({
          userId: 1,
          sharedDocId: 1,
        });
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "doctor-shared-medical-documents:1",
      );
    });

    it("should return a 404 if document not found", async () => {
      redisClient.get.mockResolvedValue(null);
      doctorsRepo.getDoctorByUserId.mockResolvedValue({ doctor_id: 1 });
      patientDocsRepo.getDoctorSharedMedicalDocumentById.mockResolvedValue(
        null,
      );

      const result =
        await doctorsDocumentsService.getDoctorSharedMedicalDocument({
          userId: 1,
          sharedDocId: 1,
        });
      expect(result.statusCode).toBe(404);
    });
  });
});
