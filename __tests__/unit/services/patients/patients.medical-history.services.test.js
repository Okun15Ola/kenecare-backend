const patientMedicalHistoryService = require("../../../../src/services/patients/patients.medical-history.services");
const patientsRepo = require("../../../../src/repository/patients.repository");
const { redisClient } = require("../../../../src/config/redis.config");

jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("Patient Medical History Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientMedicalHistory", () => {
    it("should return medical history from cache if available", async () => {
      const cachedData = { height: 180, weight: 80 };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result =
        await patientMedicalHistoryService.getPatientMedicalHistory(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith(
        "patient-medicalHistory:all",
      );
    });

    it("should return a 400 if patient profile does not exist", async () => {
      redisClient.get.mockResolvedValue(null);
      patientsRepo.getPatientByUserId.mockResolvedValue(null);
      const result =
        await patientMedicalHistoryService.getPatientMedicalHistory(1);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("createPatientMedicalHistory", () => {
    it("should create a new medical history", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientsRepo.getPatientMedicalInfoByPatientId.mockResolvedValue(null);
      patientsRepo.createPatientMedicalInfo.mockResolvedValue({ insertId: 1 });

      const result =
        await patientMedicalHistoryService.createPatientMedicalHistory({
          userId: 1,
        });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if medical history already exists", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientsRepo.getPatientMedicalInfoByPatientId.mockResolvedValue({
        id: 1,
      });

      const result =
        await patientMedicalHistoryService.createPatientMedicalHistory({
          userId: 1,
        });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("updatePatientMedicalHistory", () => {
    it("should update the medical history", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientsRepo.getPatientMedicalInfoByPatientId.mockResolvedValue({
        id: 1,
      });
      patientsRepo.updatePatientMedicalHistory.mockResolvedValue({
        affectedRows: 1,
      });

      const result =
        await patientMedicalHistoryService.updatePatientMedicalHistory({
          userId: 1,
        });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 404 if medical history not found", async () => {
      patientsRepo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      patientsRepo.getPatientMedicalInfoByPatientId.mockResolvedValue(null);

      const result =
        await patientMedicalHistoryService.updatePatientMedicalHistory({
          userId: 1,
        });
      expect(result.statusCode).toBe(404);
    });
  });
});
