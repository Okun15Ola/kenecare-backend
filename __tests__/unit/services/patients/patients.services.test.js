jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/utils/response.utils", () => ({
  SUCCESS: jest.fn(),
  NOT_FOUND: jest.fn(),
  BAD_REQUEST: jest.fn(),
  INTERNAL_SERVER_ERROR: jest.fn(),
  CREATED: jest.fn(),
  FORBIDDEN: jest.fn(),
  UNAUTHORIZED: jest.fn(),
}));
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/repository/testimonials.repository");
jest.mock("../../../../src/utils/file-upload.utils");
jest.mock("../../../../src/repository/marketers.repository");
jest.mock("../../../../src/utils/sms.utils");

const patientsService = require("../../../../src/services/patients/patients.services");
const repo = require("../../../../src/repository/patients.repository");
const Response = require("../../../../src/utils/response.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const {
  USERTYPE,
  STATUS,
  VERIFICATIONSTATUS,
} = require("../../../../src/utils/enum.utils");
const { getUserById } = require("../../../../src/repository/users.repository");
const { deleteFile } = require("../../../../src/utils/file-upload.utils");
const marketersRepo = require("../../../../src/repository/marketers.repository");
const smsUtils = require("../../../../src/utils/sms.utils");
const {
  getAllTestimonials,
} = require("../../../../src/repository/testimonials.repository");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("patients.services", () => {
  describe("getAllPatients", () => {
    it("should return cached patients if present", async () => {
      const cached = [{ patientId: 1 }];
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getAllPatients(10, 0, { total: 1 });
      expect(redisClient.get).toHaveBeenCalled();
      expect(result.data).toEqual(cached);
    });

    it("should fetch patients from repo and cache if not cached", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getAllPatients.mockResolvedValueOnce([
        {
          patient_id: 1,
          title: "Mr",
          first_name: "John",
          middle_name: "A",
          last_name: "Doe",
          gender: "M",
          profile_pic_url: "pic.jpg",
          dob: "2000-01-01",
          mobile_number: "123",
          email: "a@b.com",
          user_type: USERTYPE.PATIENT,
          is_account_active: 1,
          is_online: 1,
        },
      ]);
      redisClient.set.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getAllPatients(10, 0, { total: 1 });
      expect(repo.getAllPatients).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(result.data[0].firstName).toBe("John");
      expect(result.data[0].profilePic).toContain("user-profile/pic.jpg");
    });
  });

  describe("getPatientById", () => {
    it("should return cached patient if present", async () => {
      const cached = { patientId: 1 };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getPatientById(1);
      expect(redisClient.get).toHaveBeenCalled();
      expect(result.data).toEqual(cached);
    });

    it("should return NOT_FOUND if patient does not exist", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getPatientById.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockImplementation((data) => data);

      const result = await patientsService.getPatientById(1);
      expect(result.errorCode).toBe("PROFILE_NOT_FOUND");
    });

    it("should return patient with medical info", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getPatientById.mockResolvedValueOnce({
        patient_id: 1,
        title: "Mr",
        first_name: "John",
        middle_name: "A",
        last_name: "Doe",
        gender: "M",
        profile_pic_url: "pic.jpg",
        dob: "2000-01-01",
        mobile_number: "123",
        email: "a@b.com",
        user_type: USERTYPE.PATIENT,
        is_account_active: 1,
        is_online: 1,
      });
      repo.getPatientMedicalInfoByPatientId.mockResolvedValueOnce({
        height: 180,
        weight: 80,
        allergies: "None",
        is_patient_disabled: 0,
        disability_description: "",
        tobacco_use: null,
        tobacco_use_frequency: "",
        alcohol_use: 0,
        alcohol_use_frequency: "",
        caffine_use: null,
        caffine_use_frequency: "",
      });
      redisClient.set.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getPatientById(1);
      expect(result.data.firstName).toBe("John");
      expect(result.data.medicalInfo.height).toBe(180);
    });
  });

  describe("getPatientsTestimonial", () => {
    it("should return cached testimonials if present", async () => {
      const cached = [{ id: 1 }];
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockImplementation(({ data, pagination }) => ({
        statusCode: 200,
        message: "OK",
        data,
        pagination,
      }));

      const result = await patientsService.getPatientsTestimonial(10, 0, {
        total: 1,
      });
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(cached);
    });

    it("should return NOT_FOUND if no testimonials found", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      getAllTestimonials.mockResolvedValue([]);
      Response.NOT_FOUND.mockImplementation(({ message }) => ({
        statusCode: 404,
        message,
      }));

      const result = await patientsService.getPatientsTestimonial(10, 0, {
        total: 1,
      });

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe("Patient Testimonials Not Found");
    });

    it("should return all patients as testimonials", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      getAllTestimonials.mockResolvedValue([
        { id: 1, name: "John Doe", message: "Great service!" },
      ]);
      redisClient.set.mockResolvedValueOnce("OK");
      Response.SUCCESS.mockImplementation(({ data, pagination }) => ({
        statusCode: 200,
        message: "OK",
        data,
        pagination,
      }));

      const result = await patientsService.getPatientsTestimonial(10, 0, {
        total: 1,
      });

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe("OK");
    });
  });

  describe("getPatientByUser", () => {
    it("should return cached patient if present", async () => {
      const cachedData = { patientId: 1 };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cachedData));
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getPatientByUser(1);
      expect(result.data).toEqual(cachedData);
    });

    it("should return NOT_FOUND if patient does not exist", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getPatientByUserId.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockImplementation((data) => data);

      const result = await patientsService.getPatientByUser(1);
      expect(result.errorCode).toBe("PROFILE_NOT_FOUND");
    });

    it("should return FORBIDDEN if userId mismatch or not patient", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getPatientByUserId.mockResolvedValueOnce({
        patient_id: 1,
        user_id: 2,
        user_type: USERTYPE.DOCTOR,
      });
      Response.FORBIDDEN.mockImplementation((data) => data);

      const result = await patientsService.getPatientByUser(1);
      expect(result.message).toBe("Unauthorized account access.");
    });

    it("should return patient with medical info", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getPatientByUserId.mockResolvedValueOnce({
        patient_id: 1,
        title: "Mr",
        first_name: "John",
        middle_name: "A",
        last_name: "Doe",
        gender: "M",
        profile_pic_url: "pic.jpg",
        dob: "2000-01-01",
        mobile_number: "123",
        email: "a@b.com",
        user_id: 1,
        user_type: USERTYPE.PATIENT,
        is_account_active: 1,
        is_online: 1,
      });
      repo.getPatientMedicalInfoByPatientId.mockResolvedValueOnce({
        height: 180,
        weight: 80,
        allergies: "None",
        is_patient_disabled: 0,
        disability_description: "",
        tobacco_use: null,
        tobacco_use_frequency: "",
        alcohol_use: 0,
        alcohol_use_frequency: "",
        caffine_use: null,
        caffine_use_frequency: "",
      });
      redisClient.set.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.getPatientByUser(1);
      expect(result.data.firstName).toBe("John");
      expect(result.data.medicalInfo.height).toBe(180);
    });
  });

  describe("createPatientProfile", () => {
    it("should return NOT_FOUND if user does not exist", async () => {
      getUserById.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.message).toMatch(/Error Creating Patient Profile/);
    });

    it("should return FORBIDDEN if user not patient, not verified, or not active", async () => {
      getUserById.mockResolvedValueOnce({
        user_type: USERTYPE.DOCTOR,
        is_verified: VERIFICATIONSTATUS.NOT_VERIFIED,
        is_account_active: STATUS.NOT_ACTIVE,
      });
      Response.FORBIDDEN.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.message).toMatch(/Unauthorized Action/);
    });

    it("should return BAD_REQUEST if patient already exists", async () => {
      getUserById.mockResolvedValueOnce({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
      });
      repo.getPatientByUserId.mockResolvedValueOnce({ patient_id: 1 });
      Response.BAD_REQUEST.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.message).toMatch(/already exist/);
    });

    it("should return INTERNAL_SERVER_ERROR if createPatient fails", async () => {
      getUserById.mockResolvedValueOnce({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
      });
      repo.getPatientByUserId.mockResolvedValueOnce(null);
      repo.createPatient.mockResolvedValueOnce({ affectedRows: 0 });
      Response.INTERNAL_SERVER_ERROR.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({ userId: 1 });
      expect(result.message).toMatch(/Error Creating Patient Profile/);
    });

    it("should create patient and send SMS if referralCode exists", async () => {
      getUserById.mockResolvedValueOnce({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
        referral_code: "REF123",
        mobile_number: "123",
      });
      repo.getPatientByUserId.mockResolvedValueOnce(null);
      repo.createPatient.mockResolvedValueOnce({ affectedRows: 1 });
      marketersRepo.getMarketerByReferralCode.mockResolvedValueOnce({
        phone_number: "999",
        first_name: "Mark",
      });
      marketersRepo.getMarketersTotalRegisteredUsers.mockResolvedValueOnce({
        total_registered: 5,
      });
      smsUtils.sendMarketerUserRegisteredSMS.mockImplementation(() => {});
      Response.CREATED.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({
        userId: 1,
        firstName: "John",
        middleName: "A",
        lastName: "Doe",
        gender: "M",
        dateOfBirth: "2000-01-01",
      });
      expect(result.message).toMatch(/created successfully/);
      expect(smsUtils.sendMarketerUserRegisteredSMS).toHaveBeenCalled();
    });

    it("should create patient and not send SMS if no referralCode", async () => {
      getUserById.mockResolvedValueOnce({
        user_type: USERTYPE.PATIENT,
        is_verified: VERIFICATIONSTATUS.VERIFIED,
        is_account_active: STATUS.ACTIVE,
        referral_code: null,
      });
      repo.getPatientByUserId.mockResolvedValueOnce(null);
      repo.createPatient.mockResolvedValueOnce({ affectedRows: 1 });
      Response.CREATED.mockImplementation((data) => data);

      const result = await patientsService.createPatientProfile({
        userId: 1,
        firstName: "John",
        middleName: "A",
        lastName: "Doe",
        gender: "M",
        dateOfBirth: "2000-01-01",
      });
      expect(result.message).toMatch(/created successfully/);
      expect(smsUtils.sendMarketerUserRegisteredSMS).not.toHaveBeenCalled();
    });
  });

  describe("createPatientMedicalInfo", () => {
    it("should return BAD_REQUEST if patient does not exist", async () => {
      repo.getPatientByUserId.mockResolvedValueOnce({});
      Response.BAD_REQUEST.mockImplementation((data) => data);

      const result = await patientsService.createPatientMedicalInfo({
        userId: 1,
      });
      expect(result.message).toMatch(/Does not exist/);
    });

    it("should return BAD_REQUEST if medical info already exists", async () => {
      repo.getPatientByUserId.mockResolvedValueOnce({ patient_id: 1 });
      repo.getPatientMedicalInfoByPatientId.mockResolvedValueOnce({ id: 1 });
      Response.BAD_REQUEST.mockImplementation((data) => data);

      const result = await patientsService.createPatientMedicalInfo({
        userId: 1,
      });
      expect(result.message).toMatch(/Already Exist/);
    });

    it("should create medical info", async () => {
      repo.getPatientByUserId.mockResolvedValueOnce({ patient_id: 1 });
      repo.getPatientMedicalInfoByPatientId.mockResolvedValueOnce(null);
      repo.createPatientMedicalInfo.mockResolvedValueOnce();
      Response.CREATED.mockImplementation((data) => data);

      const result = await patientsService.createPatientMedicalInfo({
        userId: 1,
        height: 180,
        weight: 80,
      });
      expect(result.message).toMatch(/Created Successfully/);
    });
  });

  describe("updatePatientProfile", () => {
    it("should return UNAUTHORIZED if user is not patient", async () => {
      getUserById.mockResolvedValueOnce({ user_type: USERTYPE.DOCTOR });
      repo.getPatientByUserId.mockResolvedValueOnce({ patient_id: 1 });
      Response.UNAUTHORIZED.mockImplementation((data) => data);

      const result = await patientsService.updatePatientProfile({
        userId: 1,
        firstName: "John",
        lastName: "Doe",
        gender: "M",
        dateOfBirth: "2000-01-01",
      });
      expect(result.message).toMatch(/Unauthorized action/);
    });

    it("should update patient profile", async () => {
      getUserById.mockResolvedValueOnce({ user_type: USERTYPE.PATIENT });
      repo.getPatientByUserId.mockResolvedValueOnce({ patient_id: 1 });
      repo.updatePatientById.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.updatePatientProfile({
        userId: 1,
        firstName: "John",
        lastName: "Doe",
        gender: "M",
        dateOfBirth: "2000-01-01",
      });
      expect(result.message).toMatch(/updated successfully/);
    });
  });

  describe("updatePatientProfilePicture", () => {
    it("should delete old profile pic and update", async () => {
      repo.getPatientByUserId.mockResolvedValueOnce({
        profile_pic_url: "pic.jpg",
      });
      deleteFile.mockResolvedValueOnce();
      repo.updatePatientProfilePictureByUserId.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        imageUrl: "newpic.jpg",
      });
      expect(deleteFile).toHaveBeenCalled();
      expect(result.message).toMatch(/updated successfully/);
    });

    it("should update profile pic if no old pic", async () => {
      repo.getPatientByUserId.mockResolvedValueOnce({ profile_pic_url: null });
      repo.updatePatientProfilePictureByUserId.mockResolvedValueOnce();
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await patientsService.updatePatientProfilePicture({
        userId: 1,
        imageUrl: "newpic.jpg",
      });
      expect(deleteFile).not.toHaveBeenCalled();
      expect(result.message).toMatch(/updated successfully/);
    });
  });
});
