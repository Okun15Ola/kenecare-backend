jest.mock("../../../../src/services/doctors/doctors.services", () => ({
  getDoctorByUser: jest.fn(),
  getDoctorCouncilRegistration: jest.fn(),
  createDoctorProfile: jest.fn(),
  createDoctorCouncilRegistration: jest.fn(),
  updateDoctorProfile: jest.fn(),
  updateDoctorProfilePicture: jest.fn(),
}));
jest.mock("../../../../src/middlewares/logger.middleware", () => ({
  error: jest.fn(),
}));

const services = require("../../../../src/services/doctors/doctors.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetDoctorProfileController,
  GetDoctorCouncilRegistrationController,
  CreateDoctorProfileController,
  CreateDoctorCouncilRegistration,
  UpdateCouncilRegistrationController,
  UpdateDoctorProfileByIdController,
  UpdateDoctorProfilePictureController,
} = require("../../../../src/controllers/doctors/profile.controller");

describe("Doctor Profile Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
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

  describe("GetDoctorProfileController", () => {
    it("should return doctor profile", async () => {
      const mockResponse = { statusCode: 200, data: { id: 1 } };
      services.getDoctorByUser.mockResolvedValue(mockResponse);

      await GetDoctorProfileController(req, res, next);

      expect(services.getDoctorByUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorByUser.mockRejectedValue(error);

      await GetDoctorProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorCouncilRegistrationController", () => {
    it("should return council registration", async () => {
      const mockResponse = { statusCode: 200, data: { id: 1 } };
      services.getDoctorCouncilRegistration.mockResolvedValue(mockResponse);

      await GetDoctorCouncilRegistrationController(req, res, next);

      expect(services.getDoctorCouncilRegistration).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorCouncilRegistration.mockRejectedValue(error);

      await GetDoctorCouncilRegistrationController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateDoctorProfileController", () => {
    it("should create doctor profile", async () => {
      req.user.id = "3";
      req.body = {
        title: "Dr.",
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
        gender: "M",
        profileSummary: "Summary",
        specialization: 2,
        qualifications: "MBBS",
        consultationfee: 100,
        city: 5,
        yearOfExperience: 10,
      };
      const mockResponse = { statusCode: 201, data: { id: 3 } };
      services.createDoctorProfile.mockResolvedValue(mockResponse);

      await CreateDoctorProfileController(req, res, next);

      expect(services.createDoctorProfile).toHaveBeenCalledWith({
        userId: "3",
        title: "Dr.",
        firstName: "John",
        middleName: "M",
        lastName: "Doe",
        gender: "M",
        professionalSummary: "Summary",
        specializationId: 2,
        qualifications: "MBBS",
        consultationFee: 100,
        cityId: 5,
        yearOfExperience: 10,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createDoctorProfile.mockRejectedValue(error);

      await CreateDoctorProfileController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateDoctorCouncilRegistration", () => {
    it("should create doctor council registration", async () => {
      req.user.id = "4";
      req.file = { filename: "cert.pdf" };
      req.body = {
        councilId: 1,
        regNumber: "123",
        regYear: 2020,
        certIssuedDate: "2020-01-01",
        certExpiryDate: "2030-01-01",
      };
      const mockResponse = { statusCode: 201, data: { id: 4 } };
      services.createDoctorCouncilRegistration.mockResolvedValue(mockResponse);

      await CreateDoctorCouncilRegistration(req, res, next);

      expect(services.createDoctorCouncilRegistration).toHaveBeenCalledWith({
        userId: "4",
        councilId: 1,
        regNumber: "123",
        regYear: 2020,
        certIssuedDate: "2020-01-01",
        certExpiryDate: "2030-01-01",
        file: { filename: "cert.pdf" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createDoctorCouncilRegistration.mockRejectedValue(error);

      await CreateDoctorCouncilRegistration(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateCouncilRegistrationController", () => {
    it("should update council registration", async () => {
      req.user.id = "5";
      req.params.id = "10";
      req.file = { filename: "cert2.pdf" };
      req.body = {
        councilId: 2,
        regNumber: "456",
        regYear: 2021,
        certIssuedDate: "2021-01-01",
        certExpiryDate: "2031-01-01",
      };
      const mockResponse = { statusCode: 200, data: { id: 10 } };
      services.createDoctorCouncilRegistration.mockResolvedValue(mockResponse);

      await UpdateCouncilRegistrationController(req, res, next);

      expect(services.createDoctorCouncilRegistration).toHaveBeenCalledWith({
        userId: "5",
        registrationId: 10,
        councilId: 2,
        regNumber: "456",
        regYear: 2021,
        certIssuedDate: "2021-01-01",
        certExpiryDate: "2031-01-01",
        file: { filename: "cert2.pdf" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createDoctorCouncilRegistration.mockRejectedValue(error);

      await UpdateCouncilRegistrationController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateDoctorProfileByIdController", () => {
    it("should update doctor profile", async () => {
      req.user.id = "6";
      req.body = {
        title: "Dr.",
        firstname: "Jane",
        middlename: "A",
        lastname: "Smith",
        gender: "F",
        profileSummary: "Experienced",
        specialization: 3,
        qualifications: "MD",
        consultationfee: 200,
        city: 8,
        yearOfExperience: 15,
      };
      const mockResponse = { statusCode: 200, data: { id: 6 } };
      services.updateDoctorProfile.mockResolvedValue(mockResponse);

      await UpdateDoctorProfileByIdController(req, res, next);

      expect(services.updateDoctorProfile).toHaveBeenCalledWith({
        userId: 6,
        title: "Dr.",
        firstName: "Jane",
        middleName: "A",
        lastName: "Smith",
        gender: "F",
        professionalSummary: "Experienced",
        specializationId: 3,
        qualifications: "MD",
        consultationFee: 200,
        cityId: 8,
        yearOfExperience: 15,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updateDoctorProfile.mockRejectedValue(error);

      await UpdateDoctorProfileByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateDoctorProfilePictureController", () => {
    it("should update doctor profile picture", async () => {
      req.params = { userId: "7" };
      req.file = {
        filename: "profile.jpg",
        buffer: expect.any(Buffer),
        mimetype: "image/jpeg",
        originalname: "profile.jpg",
        size: 1024,
      };
      const mockResponse = { statusCode: 200, data: { id: 7 } };
      services.updateDoctorProfilePicture.mockResolvedValue(mockResponse);

      await UpdateDoctorProfilePictureController(req, res, next);

      expect(services.updateDoctorProfilePicture).toHaveBeenCalledWith({
        userId: "1",
        file: {
          filename: "profile.jpg",
          buffer: expect.any(Buffer),
          mimetype: "image/jpeg",
          originalname: "profile.jpg",
          size: 1024,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updateDoctorProfilePicture.mockRejectedValue(error);

      await UpdateDoctorProfilePictureController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
