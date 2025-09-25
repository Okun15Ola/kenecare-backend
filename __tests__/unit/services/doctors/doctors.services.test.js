/* eslint-disable no-unused-vars */
const doctorsService = require("../../../../src/services/doctors/doctors.services");
const dbObject = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../../../src/utils/enum.utils");
const { getUserById } = require("../../../../src/repository/users.repository");
const {
  adminDoctorProfileRegistrationEmail,
} = require("../../../../src/utils/email.utils");
const { doctorProfileApprovalSms } = require("../../../../src/utils/sms.utils");
const {
  createDoctorWallet,
} = require("../../../../src/repository/doctor-wallet.repository");
const { hashUsersPassword } = require("../../../../src/utils/auth.utils");
const {
  mapDoctorRow,
  mapDoctorUserProfileRow,
} = require("../../../../src/utils/db-mapper.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const {
  uploadFileToS3Bucket,
  deleteFileFromS3Bucket,
} = require("../../../../src/utils/aws-s3.utils");
const { generateFileName } = require("../../../../src/utils/file-upload.utils");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/repository/doctor-wallet.repository");
jest.mock("../../../../src/utils/auth.utils");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/caching.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/aws-s3.utils");
jest.mock("../../../../src/utils/file-upload.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn(({ page }) => ({
    currentPage: page,
    totalItems: 1,
    totalPages: 1,
    itemsPerPage: 10,
    nextPage: null,
    previousPage: null,
  })),
  cacheKeyBulider: jest.fn(
    (key, limit, offset) =>
      `${key}${limit ? `:limit=${limit}` : ""}${offset ? `:offset=${offset}` : ""}`,
  ),
}));

describe("Doctors Service", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
    jest.spyOn(Response, "UNAUTHORIZED").mockImplementation((data) => data);
    jest
      .spyOn(Response, "INTERNAL_SERVER_ERROR")
      .mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getAllDoctors", () => {
    it("returns cached doctors if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getAllDoctors(10, 0);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns doctors from db if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getAllDoctors.mockResolvedValue([{ id: 2 }]);
      mapDoctorRow.mockResolvedValue({ id: 2, name: "Dr. Test" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getAllDoctors(10, 0);
      expect(dbObject.getAllDoctors).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns empty array if no doctors found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getAllDoctors.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getAllDoctors(10, 0, { page: 1 });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No doctors found",
        data: [],
      });
      expect(result).toBe("success");
    });
  });

  describe("getDoctorByQuery", () => {
    it("returns cached data if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 3 }]));
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorByQuery(1, "test", 10, 0, {
        page: 1,
      });
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns doctors from db if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByQuery.mockResolvedValue([{ id: 4 }]);
      mapDoctorRow.mockResolvedValue({ id: 4, name: "Dr. Query" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorByQuery(1, "test", 10, 0, {
        page: 1,
      });
      expect(dbObject.getDoctorByQuery).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns empty array if no doctors found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByQuery.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorByQuery(1, "test", 10, 0, {
        page: 1,
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No doctors found",
        data: [],
      });
      expect(result).toBe("success");
    });
  });

  describe("getDoctorBySpecialtyId", () => {
    it("returns cached data if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify([{ id: 5 }]));
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorBySpecialtyId(1, 10, 0, {
        page: 1,
      });
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns doctors from db if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorsBySpecializationId.mockResolvedValue([{ id: 6 }]);
      mapDoctorRow.mockResolvedValue({ id: 6, name: "Dr. Spec" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorBySpecialtyId(1, 10, 0, {
        page: 1,
      });
      expect(dbObject.getDoctorsBySpecializationId).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns empty array if no doctors found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorsBySpecializationId.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorBySpecialtyId(1, 10, 0, {
        page: 1,
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No doctors available for this specialty",
        data: [],
      });
      expect(result).toBe("success");
    });
  });

  describe("getDoctorByUser", () => {
    it("returns cached doctor if available", async () => {
      redisClient.get.mockResolvedValue(
        JSON.stringify({ userId: 1, userType: USERTYPE.DOCTOR }),
      );
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorByUser(1);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { userId: 1, userType: USERTYPE.DOCTOR },
      });
      expect(result).toBe("success");
    });

    it("returns NOT_FOUND if doctor not found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorsService.getDoctorByUser(2);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor Profile Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("returns UNAUTHORIZED if userId or userType mismatch", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue({
        userId: 3,
        userType: USERTYPE.PATIENT,
        doctorId: 99,
      });
      mapDoctorUserProfileRow.mockResolvedValue({
        userId: 3,
        userType: USERTYPE.PATIENT,
        doctorId: 99,
      });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorsService.getDoctorByUser(2);
      expect(Response.UNAUTHORIZED).toHaveBeenCalledWith({
        message: "Unauthorized account access",
      });
      expect(result).toBe("unauthorized");
    });

    it("returns doctor if found and authorized", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue({
        userId: 4,
        userType: USERTYPE.DOCTOR,
        doctorId: 101,
      });
      mapDoctorUserProfileRow.mockResolvedValue({
        userId: 4,
        userType: USERTYPE.DOCTOR,
        doctorId: 101,
      });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorByUser(4);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { userId: 4, userType: USERTYPE.DOCTOR, doctorId: 101 },
      });
      expect(result).toBe("success");
    });
  });

  describe("getDoctorById", () => {
    it("returns cached doctor if available", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ doctorId: 1 }));
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorById(1);
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { doctorId: 1 },
      });
      expect(result).toBe("success");
    });

    it("returns NOT_FOUND if doctor not found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorsService.getDoctorById(2);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("returns doctor if found", async () => {
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorById.mockResolvedValue({ doctorId: 3 });
      mapDoctorRow.mockResolvedValue({ doctorId: 3, name: "Dr. Found" });
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.getDoctorById(3);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { doctorId: 3, name: "Dr. Found" },
      });
      expect(result).toBe("success");
    });
  });

  describe("createDoctorProfile", () => {
    it("returns NOT_FOUND if user not found", async () => {
      getUserById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorsService.createDoctorProfile({ userId: 1 });
      expect(Response.NOT_FOUND).toHaveBeenCalled();
      expect(result).toBe("not_found");
    });

    it("returns UNAUTHORIZED if user is not doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorsService.createDoctorProfile({ userId: 2 });
      expect(Response.UNAUTHORIZED).toHaveBeenCalled();
      expect(result).toBe("unauthorized");
    });

    it("returns BAD_REQUEST if doctor profile already exists", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(true);
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorsService.createDoctorProfile({ userId: 3 });
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toBe("bad_request");
    });

    it("returns INTERNAL_SERVER_ERROR if insertId is missing", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      dbObject.createDoctor.mockResolvedValue({ insertId: null });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("internal_error");
      const result = await doctorsService.createDoctorProfile({
        userId: 5,
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "male",
        professionalSummary: "test",
        specializationId: 1,
        qualifications: "test",
        consultationFee: 1.0,
        cityId: 1,
        yearOfExperience: "2 yrs",
      });
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
      expect(result).toBe("internal_error");
    });

    it("creates doctor profile successfully", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ doctor_id: 10, user_id: 5 });
      dbObject.createDoctor.mockResolvedValue({ insertId: 10 });
      // adminDoctorProfileRegistrationEmail.mockResolvedValue();
      hashUsersPassword.mockResolvedValue("hashed");
      createDoctorWallet.mockResolvedValue();
      redisClient.clearCacheByPattern.mockResolvedValue();
      Response.CREATED.mockReturnValue("created");
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        user_id: 5,
      });
      const result = await doctorsService.createDoctorProfile({
        userId: 5,
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "male",
        professionalSummary: "test",
        specializationId: 1,
        qualifications: "test",
        consultationFee: 1.0,
        cityId: 1,
        yearOfExperience: "2 yrs",
      });
      // expect(adminDoctorProfileRegistrationEmail).toHaveBeenCalled();
      expect(createDoctorWallet).toHaveBeenCalled();
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
      expect(Response.CREATED).toHaveBeenCalled();
      expect(result).toBe("created");
    });
  });

  describe("updateDoctorProfile", () => {
    it("returns NOT_FOUND if doctor not found", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      await doctorsService.updateDoctorProfile({ userId: 1 });
      expect(Response.NOT_FOUND).toBeDefined();
    });

    it("returns UNAUTHORIZED if user is not doctor", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        user_type: USERTYPE.PATIENT,
      });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorsService.updateDoctorProfile({ userId: 2 });
      expect(Response.UNAUTHORIZED).toHaveBeenCalled();
      expect(result).toBe("unauthorized");
    });

    it("returns UNAUTHORIZED if profile is not active", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        user_type: USERTYPE.DOCTOR,
        is_account_active: STATUS.NOT_ACTIVE,
      });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorsService.updateDoctorProfile({ userId: 3 });
      expect(Response.UNAUTHORIZED).toHaveBeenCalled();
      expect(result).toBe("unauthorized");
    });

    it("returns UNAUTHORIZED if profile is not approved", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        user_type: USERTYPE.DOCTOR,
        is_account_active: STATUS.ACTIVE,
        is_profile_approved: VERIFICATIONSTATUS.NOT_VERIFIED,
      });
      Response.UNAUTHORIZED.mockReturnValue("unauthorized");
      const result = await doctorsService.updateDoctorProfile({ userId: 4 });
      expect(Response.UNAUTHORIZED).toHaveBeenCalled();
      expect(result).toBe("unauthorized");
    });

    it("returns NOT_MODIFIED if update fails", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        user_type: USERTYPE.DOCTOR,
        is_account_active: STATUS.ACTIVE,
        is_profile_approved: VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 10,
      });
      dbObject.updateDoctorById.mockResolvedValue({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await doctorsService.updateDoctorProfile({
        userId: 5,
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "male",
        professionalSummary: "test",
        specializationId: 1,
        qualifications: "test",
        consultationFee: 1.0,
        cityId: 1,
        yearOfExperience: "2 yrs",
      });
      expect(Response.NOT_MODIFIED).toHaveBeenCalled();
      expect(result).toBe("not_modified");
    });

    it("updates doctor profile successfully", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        user_type: USERTYPE.DOCTOR,
        is_account_active: STATUS.ACTIVE,
        is_profile_approved: VERIFICATIONSTATUS.VERIFIED,
        doctor_id: 11,
      });
      dbObject.updateDoctorById.mockResolvedValue({ affectedRows: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.updateDoctorProfile({
        userId: 5,
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "male",
        professionalSummary: "test",
        specializationId: 1,
        qualifications: "test",
        consultationFee: 1.0,
        cityId: 1,
        yearOfExperience: "2 yrs",
      });
      expect(redisClient.delete).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });
  });

  describe("updateDoctorProfilePicture", () => {
    it("returns BAD_REQUEST if no file provided", async () => {
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      const result = await doctorsService.updateDoctorProfilePicture({
        userId: 1,
        file: null,
      });
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toBe("bad_request");
    });

    it("returns NOT_FOUND if doctor not found", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorsService.updateDoctorProfilePicture({
        userId: 2,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(Response.NOT_FOUND).toHaveBeenCalled();
      expect(result).toBe("not_found");
    });

    it("returns BAD_REQUEST if upload fails", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({ doctor_id: 3 });
      uploadFileToS3Bucket.mockRejectedValue(new Error("upload error"));
      Response.BAD_REQUEST.mockReturnValue("bad_request");
      generateFileName.mockReturnValue("file.png");
      const result = await doctorsService.updateDoctorProfilePicture({
        userId: 3,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toBe("bad_request");
    });

    it("returns INTERNAL_SERVER_ERROR if update fails", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({ doctor_id: 4 });
      uploadFileToS3Bucket.mockResolvedValue();
      dbObject.updateDoctorProfilePictureById.mockResolvedValue({
        affectedRows: 0,
      });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("internal_server_error");
      generateFileName.mockReturnValue("file.png");
      const result = await doctorsService.updateDoctorProfilePicture({
        userId: 4,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
      expect(result).toBe("internal_server_error");
    });

    it("updates profile picture successfully", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 5,
        profile_pic_url: "old.png",
      });
      uploadFileToS3Bucket.mockResolvedValue();
      dbObject.updateDoctorProfilePictureById.mockResolvedValue({
        affectedRows: 1,
      });
      deleteFileFromS3Bucket.mockResolvedValue();
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      generateFileName.mockReturnValue("file.png");
      const result = await doctorsService.updateDoctorProfilePicture({
        userId: 5,
        file: { buffer: Buffer.from(""), mimetype: "image/png" },
      });
      expect(deleteFileFromS3Bucket).toHaveBeenCalledWith("old.png");
      expect(redisClient.delete).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });
  });

  describe("approveDoctorProfile", () => {
    it("returns NOT_FOUND if doctor not found", async () => {
      dbObject.getDoctorById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("not_found");
      const result = await doctorsService.approveDoctorProfile({
        doctorId: 1,
        approvedBy: 2,
      });
      expect(Response.NOT_FOUND).toHaveBeenCalled();
      expect(result).toBe("not_found");
    });

    it("returns NOT_MODIFIED if already approved", async () => {
      dbObject.getDoctorById.mockResolvedValue({ is_profile_approved: true });
      Response.NOT_MODIFIED.mockReturnValue("not_modified");
      const result = await doctorsService.approveDoctorProfile({
        doctorId: 2,
        approvedBy: 3,
      });
      expect(Response.NOT_MODIFIED).toHaveBeenCalled();
      expect(result).toBe("not_modified");
    });

    it("approves doctor profile successfully", async () => {
      dbObject.getDoctorById.mockResolvedValue({
        is_profile_approved: false,
        mobile_number: "1234567890",
        first_name: "John",
        last_name: "Doe",
      });
      dbObject.approveDoctorProfileByDoctorId.mockResolvedValue();
      doctorProfileApprovalSms.mockResolvedValue();
      Response.SUCCESS.mockReturnValue("success");
      const result = await doctorsService.approveDoctorProfile({
        doctorId: 3,
        approvedBy: 4,
      });
      expect(dbObject.approveDoctorProfileByDoctorId).toHaveBeenCalled();
      expect(doctorProfileApprovalSms).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });
  });
});
