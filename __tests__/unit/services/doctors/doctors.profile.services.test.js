const doctorsProfileServices = require("../../../../src/services/doctors/doctors.profile.services");
const dbObject = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");
const { USERTYPE } = require("../../../../src/utils/enum.utils");
const { getUserById } = require("../../../../src/repository/users.repository");

const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../../../../src/utils/email.utils");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/utils/email.utils");

describe("doctors.profile.services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorCouncilRegistration", () => {
    it("should return NOT_FOUND if doctor profile does not exist", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue("NOT_FOUND");

      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration("user1");
      expect(result).toBe("NOT_FOUND");
      expect(dbObject.getDoctorByUserId).toHaveBeenCalledWith("user1");
    });

    it("should return UNAUTHORIZED if user id does not match or user type is not doctor", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        user_type: USERTYPE.PATIENT,
        user_id: "user2",
      });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");

      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration("user1");
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return SUCCESS with data if doctor profile exists and user is doctor", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        user_type: USERTYPE.DOCTOR,
        user_id: "user1",
      });
      dbObject.getDoctorMedicalCouncilRegistration.mockResolvedValue({
        reg: "data",
      });
      Response.SUCCESS.mockReturnValue("SUCCESS");

      const result =
        await doctorsProfileServices.getDoctorCouncilRegistration("user1");
      expect(result).toBe("SUCCESS");
      expect(dbObject.getDoctorMedicalCouncilRegistration).toHaveBeenCalledWith(
        { doctorId: 1 },
      );
    });
  });

  describe("createDoctorCouncilRegistration", () => {
    const file = { filename: "doc.pdf" };
    const userId = "user1";
    const doctorProfile = {
      doctor_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    };

    it("should return BAD_REQUEST if file is not provided", async () => {
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return UNAUTHORIZED if user is not a doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({});
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is pending", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "pending",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is rejected", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "rejected",
        reject_reason: "Invalid doc",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is approved", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "approved",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should create registration and send emails if all is valid", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({});
      adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue("CREATED");

      const result =
        await doctorsProfileServices.createDoctorCouncilRegistration({
          userId,
          councilId: 2,
          regNumber: "123",
          regYear: 2020,
          certIssuedDate: "2020-01-01",
          certExpiryDate: "2025-01-01",
          file,
        });

      expect(
        dbObject.createDoctorMedicalCouncilRegistration,
      ).toHaveBeenCalledWith({
        doctorId: 1,
        councilId: 2,
        regNumber: "123",
        regYear: 2020,
        certIssuedDate: "2020-01-01",
        certExpiryDate: "2025-01-01",
        filename: "doc.pdf",
      });
      expect(adminDoctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(doctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(result).toBe("CREATED");
    });
  });

  describe("updateDoctorCouncilRegistration", () => {
    const file = { filename: "doc.pdf" };
    const userId = "user1";
    const doctorProfile = {
      doctor_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    };

    it("should return BAD_REQUEST if file is not provided", async () => {
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return UNAUTHORIZED if user is not a doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue("UNAUTHORIZED");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("UNAUTHORIZED");
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({});
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is pending", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "pending",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is rejected", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "rejected",
        reject_reason: "Invalid doc",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should return BAD_REQUEST if registration is approved", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "approved",
      });
      Response.BAD_REQUEST.mockReturnValue("BAD_REQUEST");
      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          file,
        });
      expect(result).toBe("BAD_REQUEST");
    });

    it("should update registration and send emails if all is valid", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(doctorProfile);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue({});
      adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue("CREATED");

      const result =
        await doctorsProfileServices.updateDoctorCouncilRegistration({
          userId,
          councilId: 2,
          regNumber: "123",
          regYear: 2020,
          certIssuedDate: "2020-01-01",
          certExpiryDate: "2025-01-01",
          file,
        });

      expect(
        dbObject.createDoctorMedicalCouncilRegistration,
      ).toHaveBeenCalledWith({
        doctorId: 1,
        councilId: 2,
        regNumber: "123",
        regYear: 2020,
        certIssuedDate: "2020-01-01",
        certExpiryDate: "2025-01-01",
        filename: "doc.pdf",
      });
      expect(adminDoctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(doctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(result).toBe("CREATED");
    });
  });
});
