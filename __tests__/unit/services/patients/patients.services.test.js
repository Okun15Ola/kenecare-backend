/* eslint-disable no-unused-vars */
const patientsService = require("../../../../src/services/patients/patients.services");
const repo = require("../../../../src/repository/patients.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const { getUserById } = require("../../../../src/repository/users.repository");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../../../src/utils/enum.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const {
  getMarketerByReferralCode,
  getMarketersTotalRegisteredUsers,
} = require("../../../../src/repository/marketers.repository");
const {
  getAllTestimonials,
} = require("../../../../src/repository/testimonials.repository");
const {
  sendMarketerUserRegisteredSMS,
} = require("../../../../src/utils/sms.utils");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../../../src/utils/aws-s3.utils");
const authUtils = require("../../../../src/utils/auth.utils");

jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/repository/testimonials.repository");
jest.mock("../../../../src/repository/marketers.repository");
jest.mock("../../../../src/utils/response.utils", () => ({
  SUCCESS: jest.fn((data) => ({
    status: "success",
    data: data.data,
    message: data.message,
  })),
  NOT_FOUND: jest.fn((data) => ({
    status: "not_found",
    data: data.data,
    message: data.message,
  })),
  BAD_REQUEST: jest.fn((data) => ({
    status: "bad_request",
    data: data.data,
    message: data.message,
  })),
  INTERNAL_SERVER_ERROR: jest.fn((data) => ({
    status: "error",
    data: data.data,
    message: data.message,
  })),
  CREATED: jest.fn((data) => ({
    status: "created",
    data: data.data,
    message: data.message,
  })),
  FORBIDDEN: jest.fn((data) => ({
    status: "forbidden",
    data: data.data,
    message: data.message,
  })),
  UNAUTHORIZED: jest.fn((data) => ({
    status: "unauthorized",
    data: data.data,
    message: data.message,
  })),
  NOT_MODIFIED: jest.fn((data) => ({
    status: "not_modified",
    data: data.data,
    message: data.message,
  })),
}));
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/db-mapper.utils", () => ({
  mapPatientRow: jest.fn((row) => ({ ...row, mapped: true })),
  mapMedicalRecordRow: jest.fn((row) => ({ ...row, mapped: true })),
}));
jest.mock("../../../../src/repository/marketers.repository", () => ({
  getMarketerByReferralCode: jest.fn(),
  getMarketersTotalRegisteredUsers: jest.fn(),
}));
jest.mock("../../../../src/repository/testimonials.repository", () => ({
  getAllTestimonials: jest.fn(),
}));
jest.mock("../../../../src/utils/sms.utils", () => ({
  sendMarketerUserRegisteredSMS: jest.fn(),
}));
jest.mock("../../../../src/utils/caching.utils", () => ({
  cacheKeyBulider: jest.fn(
    (prefix, limit, offset) => `${prefix}:${limit}:${offset}`,
  ),
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
}));
jest.mock("../../../../src/utils/aws-s3.utils", () => ({
  uploadFileToS3Bucket: jest.fn(),
  deleteFileFromS3Bucket: jest.fn(),
}));
jest.mock("../../../../src/utils/file-upload.utils", () => ({
  generateFileName: jest.fn(() => "filename"),
}));
jest.mock("../../../../src/utils/auth.utils");

describe("patients.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getAllPatients", () => {
    it("returns empty array if no patients found", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getAllPatients.mockResolvedValue([]);
      const result = await patientsService.getAllPatients(10, 0, { page: 1 });
      expect(result.data).toEqual([]);
      expect(result.message).toBe("No patients found");
    });

    it("returns mapped patients and caches them", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getAllPatients.mockResolvedValue([{ patientId: 1 }]);
      redisClient.set.mockResolvedValue();
      const result = await patientsService.getAllPatients(10, 0, { page: 1 });

      expect(result.data[0].mapped).toBe(true);
      expect(redisClient.set).toHaveBeenCalled();
    });

    it("logs and throws error on failure", async () => {
      redisClient.get.mockRejectedValue(new Error("fail"));
      await expect(patientsService.getAllPatients(10, 0, {})).rejects.toThrow(
        "fail",
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getPatientById", () => {
    it("returns not found if patient does not exist", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getPatientById.mockResolvedValue(null);
      const result = await patientsService.getPatientById(1);
      expect(result.status).toBe("not_found");
    });
  });

  describe("getPatientsTestimonial", () => {
    it("returns cached testimonials if present", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 1 }]));

      const result = await patientsService.getPatientsTestimonial(10, 0, {
        page: 1,
      });
      expect(result.status).toBe("success");
    });

    it("returns empty array if no testimonials found", async () => {
      redisClient.get.mockResolvedValue(null);
      getAllTestimonials.mockResolvedValue([]);
      const result = await patientsService.getPatientsTestimonial(10, 0, {
        page: 1,
      });
      expect(result.data).toEqual([]);
      expect(result.message).toBe("No patient testimonials found");
    });

    it("returns mapped testimonials and caches them", async () => {
      redisClient.get.mockResolvedValue(null);
      getAllTestimonials.mockResolvedValue([{ patientId: 1 }]);
      redisClient.set.mockResolvedValue();
      const result = await patientsService.getPatientsTestimonial(10, 0, {
        page: 1,
      });
      expect(result.data[0].mapped).toBe(true);
      expect(redisClient.set).toHaveBeenCalled();
    });

    it("logs and throws error on failure", async () => {
      redisClient.get.mockRejectedValue(new Error("fail"));
      await expect(
        patientsService.getPatientsTestimonial(10, 0, {}),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("getPatientByUser", () => {
    it("returns not found if patient does not exist", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getPatientByUserId.mockResolvedValue(null);
      const result = await patientsService.getPatientByUser(1);
      expect(result.status).toBe("not_found");
    });

    it("returns forbidden if userId mismatch or userType wrong", async () => {
      redisClient.get.mockResolvedValue(null);
      repo.getPatientByUserId.mockResolvedValue({
        patientId: 1,
        userId: 2,
        userType: USERTYPE.DOCTOR,
      });
      const result = await patientsService.getPatientByUser(1);
      expect(result.status).toBe("forbidden");
    });

    // it("logs and throws error on failure", async () => {
    //   redisClient.get.mockRejectedValue(new Error("fail"));
    //   await expect(patientsService.getPatientByUser(1)).rejects.toThrow("fail");
    //   expect(logger.error).toHaveBeenCalled();
    // });
  });

  describe("createPatientProfile", () => {
    it("returns not found if user does not exist", async () => {
      getUserById.mockResolvedValue(null);
      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.status).toBe("not_found");
    });

    it("returns bad request if patient already exists", async () => {
      getUserById.mockResolvedValue({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
      });
      repo.getPatientByUserId.mockResolvedValue({ patientId: 1 });
      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.status).toBe("bad_request");
    });

    it("returns internal server error if creation fails", async () => {
      getUserById.mockResolvedValue({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
      });
      repo.getPatientByUserId.mockResolvedValue(null);
      repo.createPatient.mockResolvedValue({ affectedRows: 0 });
      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.status).toBe("error");
    });

    it("returns created if successful", async () => {
      getUserById.mockResolvedValue({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
        referral_code: null,
      });
      repo.getPatientByUserId.mockResolvedValue(null);
      repo.createPatient.mockResolvedValue({ affectedRows: 1 });
      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.status).toBe("created");
    });

    it("sends SMS if referralCode exists and marketer found", async () => {
      getUserById.mockResolvedValue({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
        referral_code: "ref123",
        mobile_number: "08012345678",
      });
      repo.getPatientByUserId.mockResolvedValue(null);
      repo.createPatient.mockResolvedValue({ affectedRows: 1 });
      getMarketerByReferralCode.mockResolvedValue({
        phone_number: "08087654321",
        first_name: "Marketer",
      });
      getMarketersTotalRegisteredUsers.mockResolvedValue({
        total_registered: 5,
      });
      await patientsService.createPatientProfile({ userId: 1 });
      expect(sendMarketerUserRegisteredSMS).toHaveBeenCalled();
    });

    it("logs and throws error on failure", async () => {
      getUserById.mockRejectedValue(new Error("fail"));
      await expect(
        patientsService.createPatientProfile({ userId: 1 }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updatePatientProfile", () => {
    it("returns not modified if update fails", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      repo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      repo.updatePatientById.mockResolvedValue({ affectedRows: 0 });
      const result = await patientsService.updatePatientProfile({
        userId: 1,
        dateOfBirth: "2000-01-01",
      });
      expect(result.status).toBe("not_modified");
    });

    it("returns success if update succeeds", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      repo.getPatientByUserId.mockResolvedValue({ patient_id: 1 });
      repo.updatePatientById.mockResolvedValue({ affectedRows: 1 });
      const result = await patientsService.updatePatientProfile({
        userId: 1,
        dateOfBirth: "2000-01-01",
      });
      expect(result.status).toBe("success");
    });

    it("logs and throws error on failure", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      repo.getPatientByUserId.mockRejectedValue(new Error("fail"));
      await expect(
        patientsService.updatePatientProfile({
          userId: 1,
          dateOfBirth: "2000-01-01",
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("updatePatientProfilePicture", () => {
    it("returns bad request if no file provided", async () => {
      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
      });
      expect(result.status).toBe("bad_request");
    });

    it("returns not found if patient does not exist", async () => {
      repo.getPatientByUserId.mockResolvedValue({
        profile_pic_url: null,
        patient_id: null,
      });
      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        file: { buffer: Buffer.alloc(0), mimetype: "image/png" }, // simpler & clearer
      });

      expect(result.status).toBe("not_found");
    });

    it("returns bad request if upload fails", async () => {
      repo.getPatientByUserId.mockResolvedValue({
        patient_id: 1,
        profile_pic_url: null,
      });
      uploadFileToS3Bucket.mockRejectedValue(new Error("fail"));
      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(result.status).toBe("bad_request");
    });

    it("returns not modified if update fails", async () => {
      repo.getPatientByUserId.mockResolvedValue({
        profile_pic_url: null,
        patient_id: 1,
      });
      uploadFileToS3Bucket.mockResolvedValue();
      repo.updatePatientProfilePictureByUserId.mockResolvedValue({
        affectedRows: 0,
      });
      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(result.status).toBe("not_modified");
    });

    it("deletes old profile pic if exists", async () => {
      repo.getPatientByUserId.mockResolvedValue({
        profile_pic_url: "old_pic",
        patient_id: 1,
      });
      uploadFileToS3Bucket.mockResolvedValue();
      repo.updatePatientProfilePictureByUserId.mockResolvedValue({
        affectedRows: 1,
      });
      deleteFileFromS3Bucket.mockResolvedValue();
      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(result.status).toBe("success");
      expect(deleteFileFromS3Bucket).toHaveBeenCalledWith("old_pic");
    });

    it("logs and throws error on failure", async () => {
      repo.getPatientByUserId.mockRejectedValue(new Error("fail"));
      await expect(
        patientsService.updatePatientProfilePicture({
          userId: 1,
          file: { buffer: Buffer.from(""), mimetype: "image/png" },
        }),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
