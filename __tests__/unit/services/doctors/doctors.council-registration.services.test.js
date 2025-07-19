const doctorsCouncilRegistrationServices = require("../../../../src/services/doctors/doctors.council-registration.services");
const dbObject = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");
const { USERTYPE } = require("../../../../src/utils/enum.utils");
const { getUserById } = require("../../../../src/repository/users.repository");
const { uploadFileToS3Bucket } = require("../../../../src/utils/aws-s3.utils");
const { generateFileName } = require("../../../../src/utils/file-upload.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const {
  mapDoctorCouncilRow,
} = require("../../../../src/utils/db-mapper.utils");
const {
  doctorCouncilRegistrationEmail,
  adminDoctorCouncilRegistrationEmail,
} = require("../../../../src/utils/email.utils");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/repository/users.repository");
jest.mock("../../../../src/utils/email.utils");
jest.mock("../../../../src/utils/aws-s3.utils");
jest.mock("../../../../src/utils/file-upload.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("doctors.council-registration.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
    jest.spyOn(Response, "FORBIDDEN").mockImplementation((data) => data);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorCouncilRegistration", () => {
    it("should return cached data if present", async () => {
      const id = "user1";
      const cached = { foo: "bar" };
      redisClient.get.mockResolvedValue(JSON.stringify(cached));
      Response.SUCCESS.mockReturnValue({ status: "ok", data: cached });

      const result =
        await doctorsCouncilRegistrationServices.getDoctorCouncilRegistration(
          id,
        );

      expect(redisClient.get).toHaveBeenCalledWith(
        `doctor-council-registration:${id}`,
      );
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: cached });
      expect(result).toEqual({ status: "ok", data: cached });
    });

    it("should return NOT_FOUND if doctor not found", async () => {
      const id = "user2";
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await doctorsCouncilRegistrationServices.getDoctorCouncilRegistration(
          id,
        );

      expect(dbObject.getDoctorByUserId).toHaveBeenCalledWith(id);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor Profile Not Found",
      });
      expect(result).toEqual({ status: 404 });
    });

    it("should return FORBIDDEN if user id/type mismatch", async () => {
      const id = "user3";
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        user_type: USERTYPE.PATIENT,
        user_id: "otherUser",
      });
      Response.FORBIDDEN.mockReturnValue({ status: 403 });

      const result =
        await doctorsCouncilRegistrationServices.getDoctorCouncilRegistration(
          id,
        );

      expect(Response.FORBIDDEN).toHaveBeenCalled();
      expect(result).toEqual({ status: 403 });
    });

    it("should return NOT_FOUND if council registration not found", async () => {
      const id = "user4";
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 2,
        user_type: USERTYPE.DOCTOR,
        user_id: id,
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(undefined);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });

      const result =
        await doctorsCouncilRegistrationServices.getDoctorCouncilRegistration(
          id,
        );

      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Medical council registration not found",
      });
      expect(result).toEqual({ status: 404 });
    });

    it("should fetch from db, cache and return registration", async () => {
      const id = "user5";
      const doctor = {
        doctor_id: 3,
        user_type: USERTYPE.DOCTOR,
        user_id: id,
      };
      const rawData = { foo: "bar" };
      const mapped = { mapped: true };
      redisClient.get.mockResolvedValue(null);
      dbObject.getDoctorByUserId.mockResolvedValue(doctor);
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue([rawData]);
      mapDoctorCouncilRow.mockResolvedValue(mapped);
      Response.SUCCESS.mockReturnValue({ status: "ok", data: mapped });

      const result =
        await doctorsCouncilRegistrationServices.getDoctorCouncilRegistration(
          id,
        );

      expect(redisClient.set).toHaveBeenCalledWith({
        key: `doctor-council-registration:${id}`,
        value: JSON.stringify(mapped),
      });
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: mapped });
      expect(result).toEqual({ status: "ok", data: mapped });
    });
  });

  describe("createDoctorCouncilRegistration", () => {
    const baseArgs = {
      userId: "user1",
      councilId: 1,
      regNumber: "123",
      regYear: 2020,
      certIssuedDate: "2020-01-01",
      certExpiryDate: "2025-01-01",
      file: { buffer: Buffer.from("abc"), mimetype: "application/pdf" },
    };

    it("should return BAD_REQUEST if file is missing", async () => {
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          {
            ...baseArgs,
            file: undefined,
          },
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Please upload medical council registration certificate.",
      });
      expect(result).toEqual({ status: 400 });
    });

    it("should return NOT_FOUND if user not found", async () => {
      getUserById.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.NOT_FOUND).toHaveBeenCalled();
      expect(result).toEqual({ status: 404 });
    });

    it("should return FORBIDDEN if user is not doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.FORBIDDEN.mockReturnValue({ status: 403 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.FORBIDDEN).toHaveBeenCalled();
      expect(result).toEqual({ status: 403 });
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toEqual({ status: 400 });
    });

    it("should return BAD_REQUEST if registration is pending", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "pending",
      });
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toEqual({ status: 400 });
    });

    it("should return BAD_REQUEST if registration is rejected", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "rejected",
        reject_reason: "Invalid",
      });
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toEqual({ status: 400 });
    });

    it("should return NOT_MODIFIED if registration is approved", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        registration_status: "approved",
      });
      Response.NOT_MODIFIED.mockReturnValue({ status: 304 });
      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.NOT_MODIFIED).toHaveBeenCalled();
      expect(result).toEqual({ status: 304 });
    });

    it("should create registration, upload file, send emails and return CREATED", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      generateFileName.mockReturnValue("file.pdf");
      uploadFileToS3Bucket.mockResolvedValue();
      dbObject.createDoctorMedicalCouncilRegistration.mockResolvedValue();
      adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.CREATED.mockReturnValue({ status: 201 });

      const result =
        await doctorsCouncilRegistrationServices.createDoctorCouncilRegistration(
          baseArgs,
        );

      expect(uploadFileToS3Bucket).toHaveBeenCalled();
      expect(
        dbObject.createDoctorMedicalCouncilRegistration,
      ).toHaveBeenCalled();
      expect(adminDoctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(doctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(Response.CREATED).toHaveBeenCalled();
      expect(result).toEqual({ status: 201 });
    });
  });

  describe("updateDoctorCouncilRegistration", () => {
    const baseArgs = {
      userId: "user1",
      councilId: 1,
      regNumber: "123",
      regYear: 2020,
      certIssuedDate: "2020-01-01",
      certExpiryDate: "2025-01-01",
      file: { buffer: Buffer.from("abc"), mimetype: "application/pdf" },
    };

    it("should return BAD_REQUEST if file is missing", async () => {
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.updateDoctorCouncilRegistration(
          {
            ...baseArgs,
            file: undefined,
          },
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Please upload medical council registration document.",
      });
      expect(result).toEqual({ status: 400 });
    });

    it("should return UNAUTHORIZED if user is not doctor", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.PATIENT });
      Response.UNAUTHORIZED.mockReturnValue({ status: 401 });
      const result =
        await doctorsCouncilRegistrationServices.updateDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.UNAUTHORIZED).toHaveBeenCalled();
      expect(result).toEqual({ status: 401 });
    });

    it("should return BAD_REQUEST if doctor profile does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({});
      Response.BAD_REQUEST.mockReturnValue({ status: 400 });
      const result =
        await doctorsCouncilRegistrationServices.updateDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
      expect(result).toEqual({ status: 400 });
    });

    it("should return NOT_FOUND if registration does not exist", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({ status: 404 });
      const result =
        await doctorsCouncilRegistrationServices.updateDoctorCouncilRegistration(
          baseArgs,
        );
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Council registration not found",
      });
      expect(result).toEqual({ status: 404 });
    });

    it("should update registration, upload file, send emails and return SUCCESS", async () => {
      getUserById.mockResolvedValue({ user_type: USERTYPE.DOCTOR });
      dbObject.getDoctorByUserId.mockResolvedValue({
        doctor_id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
      });
      dbObject.getCouncilRegistrationByDoctorId.mockResolvedValue({
        council_registration_id: 2,
        registration_document_url: "file.pdf",
      });
      uploadFileToS3Bucket.mockResolvedValue();
      dbObject.updateDoctorMedicalCouncilRegistration.mockResolvedValue();
      adminDoctorCouncilRegistrationEmail.mockResolvedValue();
      doctorCouncilRegistrationEmail.mockResolvedValue();
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result =
        await doctorsCouncilRegistrationServices.updateDoctorCouncilRegistration(
          baseArgs,
        );

      expect(uploadFileToS3Bucket).toHaveBeenCalled();
      expect(
        dbObject.updateDoctorMedicalCouncilRegistration,
      ).toHaveBeenCalled();
      expect(adminDoctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(doctorCouncilRegistrationEmail).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ status: 200 });
    });
  });
});
