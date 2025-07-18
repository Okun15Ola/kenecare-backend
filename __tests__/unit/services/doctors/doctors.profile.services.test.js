const doctorsProfileServices = require("../../../../src/services/doctors/doctors.profile.services");
const dbObject = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");
const { USERTYPE } = require("../../../../src/utils/enum.utils");
const { getUserById } = require("../../../../src/repository/users.repository");
const emailUtils = require("../../../../src/utils/email.utils");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("doctors.profile.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorCouncilRegistration", () => {
    it("should return NOT_FOUND if doctor profile not found", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("NOT_FOUND");
      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration(1);
      expect(logger.error).toHaveBeenCalledWith(
        "Doctor profile not found for userId: 1",
      );
      expect(result).toBe("NOT_FOUND");
    });

    it("should return UNAUTHORIZED if userId or userType mismatch", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 2,
        user_type: USERTYPE.PATIENT,
        user_id: 3,
      });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");
      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration(1);
      expect(logger.error).toHaveBeenCalledWith(
        "Unauthorized access attempt by userId: 1 for doctorId: 2",
      );
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return SUCCESS with council registration data", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 2,
        user_type: USERTYPE.DOCTOR,
        user_id: 1,
      });
      dbObject.getDoctorMedicalCouncilRegistration.mockResolvedValue({
        reg: "data",
      });
      Response.SUCCESS.mockReturnValue("SUCCESS");
      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration(1);
      expect(result).toBe("SUCCESS");
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: { reg: "data" } });
    });

    it("should log and throw error on exception", async () => {
      dbObject.getDoctorByUserId.mockRejectedValue(new Error("fail"));
      await expect(
        doctorsProfileServices.getDoctorCouncilRegistration(1),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalledWith(
        "getDoctorCouncilRegistration: ",
        expect.any(Error),
      );
    });
  });

  describe("createDoctorCouncilRegistration", () => {
    const params = {
      userId: 1,
      councilId: 2,
      regNumber: "123",
      regYear: 2020,
      certIssuedDate: "2021-01-01",
      certExpiryDate: "2025-01-01",
      file: { filename: "doc.pdf" },
    };

    it("should return BAD_REQUEST if no file provided", async () => {
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          ...params,
          file: null,
        });
      expect(logger.error).toHaveBeenCalledWith(
        "No file provided for council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return UNAUTHORIZED if user is not a doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({});
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(logger.error).toHaveBeenCalledWith(
        "Doctor profile not found for userId: 1 while creating council registration",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is pending", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "pending",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has a pending council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is rejected", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "rejected",
        reject_reason: "Invalid document",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has a rejected council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is approved", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "approved",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has an approved council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return INTERNAL_SERVER_ERROR if insertId is missing", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({});
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("INTERNAL_SERVER_ERROR");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to create council registration for doctorId: 10",
      );
      expect(result).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should send emails and return CREATED on success", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({
        insertId: 99,
      });
      emailUtils.adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      emailUtils.doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue("CREATED");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration(params);
      expect(
        emailUtils.adminDoctorCouncilRegistrationEmail,
      ).toHaveBeenCalledWith({
        doctorName: "John Doe",
      });
      expect(emailUtils.doctorCouncilRegistrationEmail).toHaveBeenCalledWith({
        doctorEmail: "doc@email.com",
        doctorName: "John Doe",
      });
      expect(result).toBe("CREATED");
    });

    it("should log and throw error on exception", async () => {
      getUserById.mockRejectedValue(new Error("fail"));
      await expect(
        doctorsProfileServices.createDoctorCouncilRegistration(params),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalledWith(
        "createDoctorCouncilRegistration: ",
        expect.any(Error),
      );
    });
  });

  describe("updateDoctorCouncilRegistration", () => {
    const params = {
      userId: 1,
      councilId: 2,
      regNumber: "123",
      regYear: 2020,
      certIssuedDate: "2021-01-01",
      certExpiryDate: "2025-01-01",
      file: { filename: "doc.pdf" },
    };

    it("should return BAD_REQUEST if no file provided", async () => {
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          ...params,
          file: null,
        });
      expect(logger.error).toHaveBeenCalledWith(
        "No file provided for council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return UNAUTHORIZED if user is not a doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({});
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(logger.error).toHaveBeenCalledWith(
        "Doctor profile not found for userId: 1 while updating council registration",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is pending", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "pending",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has a pending council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is rejected", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "rejected",
        reject_reason: "Invalid document",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has a rejected council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if council registration is approved", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "approved",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(logger.warn).toHaveBeenCalledWith(
        "Doctor with ID 10 has an approved council registration.",
      );
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return INTERNAL_SERVER_ERROR if insertId is missing", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({});
      Response.INTERNAL_SERVER_ERROR.mockReturnValue("INTERNAL_SERVER_ERROR");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to create council registration for doctorId: 10",
      );
      expect(result).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should send emails and return CREATED on success", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 10,
        first_name: "John",
        last_name: "Doe",
        email: "doc@email.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({
        insertId: 99,
      });
      emailUtils.adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      emailUtils.doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue("CREATED");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration(params);
      expect(
        emailUtils.adminDoctorCouncilRegistrationEmail,
      ).toHaveBeenCalledWith({
        doctorName: "John Doe",
      });
      expect(emailUtils.doctorCouncilRegistrationEmail).toHaveBeenCalledWith({
        doctorEmail: "doc@email.com",
        doctorName: "John Doe",
      });
      expect(result).toBe("CREATED");
    });

    it("should log and throw error on exception", async () => {
      getUserById.mockRejectedValue(new Error("fail"));
      await expect(
        doctorsProfileServices.updateDoctorCouncilRegistration(params),
      ).rejects.toThrow("fail");
      expect(logger.error).toHaveBeenCalledWith(
        "updateDoctorCouncilRegistration: ",
        expect.any(Error),
      );
    });
  });
});
