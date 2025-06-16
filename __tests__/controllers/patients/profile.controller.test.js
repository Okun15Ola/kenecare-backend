const services = require("../../../src/services/patients/patients.services");
const logger = require("../../../src/middlewares/logger.middleware");

const {
  GetPatientProfileController,
  CreatePatientProfileController,
  UpdatePatientProfileController,
  UpdatePatientProfilePictureController,
} = require("../../../src/controllers/patients/profile.controller");

jest.mock("../../../src/services/patients/patients.services");
jest.mock("../../../src/middlewares/logger.middleware");

describe("Patient Profile Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      body: {},
      file: {},
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
      const mockResponse = { statusCode: 200, data: { id: 1 } };
      services.getPatientByUser.mockResolvedValue(mockResponse);

      await GetPatientProfileController(req, res, next);

      expect(services.getPatientByUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientByUser.mockRejectedValue(error);

      await GetPatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreatePatientProfileController", () => {
    it("should create patient profile", async () => {
      req.body = {
        firstname: "Jane",
        middlename: "A",
        lastname: "Doe",
        gender: "F",
        dateOfBirth: "1990-01-01",
      };
      const mockResponse = { statusCode: 201, data: { id: 2 } };
      services.createPatientProfile.mockResolvedValue(mockResponse);

      await CreatePatientProfileController(req, res, next);

      expect(services.createPatientProfile).toHaveBeenCalledWith({
        userId: "1",
        firstName: "Jane",
        middleName: "A",
        lastName: "Doe",
        gender: "F",
        dateOfBirth: "1990-01-01",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createPatientProfile.mockRejectedValue(error);

      await CreatePatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePatientProfileController", () => {
    it("should update patient profile", async () => {
      req.body = {
        firstname: "John",
        middlename: "B",
        lastname: "Smith",
        gender: "M",
        dateOfBirth: "1985-05-05",
      };
      const mockResponse = { statusCode: 200, data: { id: 3 } };
      services.updatePatientProfile.mockResolvedValue(mockResponse);

      await UpdatePatientProfileController(req, res, next);

      expect(services.updatePatientProfile).toHaveBeenCalledWith({
        userId: "1",
        firstName: "John",
        middleName: "B",
        lastName: "Smith",
        gender: "M",
        dateOfBirth: "1985-05-05",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updatePatientProfile.mockRejectedValue(error);

      await UpdatePatientProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePatientProfilePictureController", () => {
    it("should update patient profile picture", async () => {
      req.file = { filename: "profile.jpg" };
      const mockResponse = { statusCode: 200, data: { id: 4 } };
      services.updatePatientProfilePicture.mockResolvedValue(mockResponse);

      await UpdatePatientProfilePictureController(req, res, next);

      expect(services.updatePatientProfilePicture).toHaveBeenCalledWith({
        userId: "1",
        imageUrl: "profile.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updatePatientProfilePicture.mockRejectedValue(error);

      await UpdatePatientProfilePictureController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
