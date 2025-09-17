const {
  GetPatientProfileController,
  CreatePatientProfileController,
  UpdatePatientProfileController,
  UpdatePatientProfilePictureController,
} = require("../../../../src/controllers/patients/profile.controller");
const patientServices = require("../../../../src/services/patients/patients.services");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/services/patients/patients.services", () => ({
  getPatientByUser: jest.fn(),
  createPatientProfile: jest.fn(),
  updatePatientProfile: jest.fn(),
  updatePatientProfilePicture: jest.fn(),
}));
jest.mock("../../../../src/middlewares/logger.middleware", () => ({
  error: jest.fn(),
}));

describe("Patient Profile Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      body: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetPatientProfileController", () => {
    it("should return patient profile", async () => {
      const mockResponse = { statusCode: 200, data: { id: "1" } };
      patientServices.getPatientByUser.mockResolvedValue(mockResponse);

      await GetPatientProfileController(req, res, next);

      expect(patientServices.getPatientByUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      patientServices.getPatientByUser.mockRejectedValue(error);

      await GetPatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreatePatientProfileController", () => {
    it("should create patient profile", async () => {
      req.user.id = "2";
      req.body = {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
        gender: "M",
        dateOfBirth: "1990-01-01",
      };
      const mockResponse = { statusCode: 201, data: { id: "2" } };
      patientServices.createPatientProfile.mockResolvedValue(mockResponse);

      await CreatePatientProfileController(req, res, next);

      expect(patientServices.createPatientProfile).toHaveBeenCalledWith({
        userId: "2",
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "M",
        dateOfBirth: "1990-01-01",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      patientServices.createPatientProfile.mockRejectedValue(error);

      await CreatePatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePatientProfileController", () => {
    it("should update patient profile", async () => {
      req.user.id = "3";
      req.body = {
        firstname: "Jane",
        middlename: "A",
        lastname: "Smith",
        gender: "F",
        dateOfBirth: "1985-05-05",
      };
      const mockResponse = { statusCode: 200, data: { id: "3" } };
      patientServices.updatePatientProfile.mockResolvedValue(mockResponse);

      await UpdatePatientProfileController(req, res, next);

      expect(patientServices.updatePatientProfile).toHaveBeenCalledWith({
        userId: "3",
        firstName: "Jane",
        middleName: "A",
        lastName: "Smith",
        gender: "F",
        dateOfBirth: "1985-05-05",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      patientServices.updatePatientProfile.mockRejectedValue(error);

      await UpdatePatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePatientProfilePictureController", () => {
    it("should update patient profile picture", async () => {
      req.user.id = "4";
      req.file = { filename: "profile.jpg" };
      const mockResponse = { statusCode: 200, data: { id: "4" } };
      patientServices.updatePatientProfilePicture.mockResolvedValue(
        mockResponse,
      );

      await UpdatePatientProfilePictureController(req, res, next);

      expect(patientServices.updatePatientProfilePicture).toHaveBeenCalledWith({
        userId: "4",
        file: { filename: "profile.jpg" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      patientServices.updatePatientProfilePicture.mockRejectedValue(error);

      await UpdatePatientProfilePictureController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
