const doctorsDocumentsServices = require("../../../../src/services/doctors/doctors.documents.services");
const patientDocsRepository = require("../../../../src/repository/patient-docs.repository");
const doctorsRepository = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");
const redisConfig = require("../../../../src/config/redis.config");
const dbMapperUtils = require("../../../../src/utils/db-mapper.utils");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/repository/patient-docs.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("doctors.documents.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    redisConfig.redisClient.get = jest.fn();
    redisConfig.redisClient.set = jest.fn();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorSharedMedicalDocuments", () => {
    const userId = "user-123";
    const doctor = { doctor_id: "doc-1", title: "Dr." };
    const rawDocs = [{ id: 1 }, { id: 2 }];
    const mappedDocs = [{ mapped: 1 }, { mapped: 2 }];

    it("returns NOT_FOUND if doctor profile not found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ notFound: true });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocuments(userId);

      expect(doctorsRepository.getDoctorByUserId).toHaveBeenCalledWith(userId);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor Profile Not Found",
      });
      expect(result).toEqual({ notFound: true });
    });

    it("returns empty array if no documents found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      patientDocsRepository.getSharedMedicalDocumentsByDoctorId.mockResolvedValue(
        [],
      );
      Response.SUCCESS.mockReturnValue({ success: true, data: [] });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocuments(userId);

      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No shared medical documents found at the moment.",
        data: [],
      });
      expect(result).toEqual({ success: true, data: [] });
    });

    it("maps and caches documents if found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      patientDocsRepository.getSharedMedicalDocumentsByDoctorId.mockResolvedValue(
        rawDocs,
      );
      dbMapperUtils.mapDoctorSharedMedicalDocs.mockImplementation(
        (row, title) => ({ ...row, mapped: true, title }),
      );
      Response.SUCCESS.mockReturnValue({ success: true, data: mappedDocs });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocuments(userId);

      expect(dbMapperUtils.mapDoctorSharedMedicalDocs).toHaveBeenCalledTimes(
        rawDocs.length,
      );

      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mappedDocs });
    });
  });

  describe("getDoctorSharedMedicalDocument", () => {
    const userId = "user-123";
    const sharedDocId = "doc-456";
    const doctor = { doctor_id: "doc-1", title: "Dr." };
    const document = { id: 1 };
    const mappedDocument = { mapped: 1 };
    const cacheKey = `doctor:${doctor.doctor_id}:documents:${sharedDocId}`;

    it("returns cached data if present", async () => {
      redisConfig.redisClient.get.mockResolvedValue(
        JSON.stringify(mappedDocument),
      );
      Response.SUCCESS.mockReturnValue({ success: true, data: mappedDocument });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocument({
          userId,
          sharedDocId,
        });

      expect(redisConfig.redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: mappedDocument });
      expect(result).toEqual({ success: true, data: mappedDocument });
    });

    it("returns NOT_FOUND if doctor profile not found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ notFound: true });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocument({
          userId,
          sharedDocId,
        });

      expect(doctorsRepository.getDoctorByUserId).toHaveBeenCalledWith(userId);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor Profile Not Found",
      });
      expect(result).toEqual({ notFound: true });
    });

    it("returns NOT_FOUND if document not found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      patientDocsRepository.getDoctorSharedMedicalDocumentById.mockResolvedValue(
        null,
      );
      Response.NOT_FOUND.mockReturnValue({ notFound: true });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocument({
          userId,
          sharedDocId,
        });

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Shared Medical Document not found"),
      );
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Shared Medical Document Not Found.",
      });
      expect(result).toEqual({ notFound: true });
    });

    it("maps and caches document if found", async () => {
      redisConfig.redisClient.get.mockResolvedValue(null);
      doctorsRepository.getDoctorByUserId.mockResolvedValue(doctor);
      patientDocsRepository.getDoctorSharedMedicalDocumentById.mockResolvedValue(
        document,
      );
      dbMapperUtils.mapDoctorSharedMedicalDocs.mockResolvedValue(
        mappedDocument,
      );
      Response.SUCCESS.mockReturnValue({ success: true, data: mappedDocument });

      const result =
        await doctorsDocumentsServices.getDoctorSharedMedicalDocument({
          userId,
          sharedDocId,
        });

      expect(dbMapperUtils.mapDoctorSharedMedicalDocs).toHaveBeenCalledWith(
        document,
        doctor.title,
        true,
      );
      expect(redisConfig.redisClient.set).toHaveBeenCalledWith({
        key: cacheKey,
        value: JSON.stringify(mappedDocument),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: mappedDocument });
      expect(result).toEqual({ success: true, data: mappedDocument });
    });

    it("logs and throws error on exception", async () => {
      redisConfig.redisClient.get.mockRejectedValue(new Error("Redis error"));
      await expect(
        doctorsDocumentsServices.getDoctorSharedMedicalDocument({
          userId,
          sharedDocId,
        }),
      ).rejects.toThrow("Redis error");
      expect(logger.error).toHaveBeenCalledWith(
        "getDoctorSharedMedicalDocument: ",
        expect.any(Error),
      );
    });
  });
});
