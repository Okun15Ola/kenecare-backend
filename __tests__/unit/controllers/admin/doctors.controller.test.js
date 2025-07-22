jest.mock("../../../../src/services/admin/doctors.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const doctorsServices = require("../../../../src/services/admin/doctors.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetDoctorsController,
  GetDoctorByIDController,
  CreateDoctorController,
  UpdateDoctorByIdController,
  ApproveDoctorAccountController,
  DeleteDoctorByIdController,
} = require("../../../../src/controllers/admin/doctors.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Doctors Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GetDoctorsController", () => {
    it("should return doctors with correct status", async () => {
      const res = mockRes();
      const req = {
        query: { limit: 10, page: 1 },
      };
      const response = { statusCode: 200, data: [{ id: 1 }] };
      doctorsServices.getAllDoctors = jest.fn().mockResolvedValue(response);

      await GetDoctorsController(req, res, mockNext);

      expect(doctorsServices.getAllDoctors).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        query: { limit: 10, page: 1 },
      };
      const error = new Error("fail");
      doctorsServices.getAllDoctors.mockRejectedValue(error);

      await GetDoctorsController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalledWith(expect.anything());
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorByIDController", () => {
    it("should return doctor by id", async () => {
      const res = mockRes();
      const req = { params: { id: "123" } };
      const response = { statusCode: 200, data: { id: "123" } };
      doctorsServices.getDoctorById.mockResolvedValue(response);

      await GetDoctorByIDController(req, res, mockNext);

      expect(doctorsServices.getDoctorById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "123" } };
      const error = new Error("fail");
      doctorsServices.getDoctorById.mockRejectedValue(error);

      await GetDoctorByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateDoctorController", () => {
    it("should send Created Doctor", async () => {
      const res = mockRes();
      const req = {};
      await CreateDoctorController(req, res, mockNext);
      expect(res.send).toHaveBeenCalledWith("Created Doctor");
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {};
      const error = new Error("fail");
      res.send.mockImplementation(() => {
        throw error;
      });

      await CreateDoctorController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateDoctorByIdController", () => {
    it("should send Updated Doctor", async () => {
      const res = mockRes();
      const req = {};
      await UpdateDoctorByIdController(req, res, mockNext);
      expect(res.send).toHaveBeenCalledWith("Updated Doctor");
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {};
      const error = new Error("fail");
      res.send.mockImplementation(() => {
        throw error;
      });

      await UpdateDoctorByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("ApproveDoctorAccountController", () => {
    it("should approve doctor account", async () => {
      const res = mockRes();
      const req = { params: { id: "456" }, user: { id: "789" } };
      const response = { statusCode: 200, data: { approved: true } };
      doctorsServices.approveDoctorProfile.mockResolvedValue(response);

      await ApproveDoctorAccountController(req, res, mockNext);

      expect(doctorsServices.approveDoctorProfile).toHaveBeenCalledWith({
        doctorId: "456",
        approvedBy: 789,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "456" }, user: { id: "789" } };
      const error = new Error("fail");
      doctorsServices.approveDoctorProfile.mockRejectedValue(error);

      await ApproveDoctorAccountController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteDoctorByIdController", () => {
    it("should send Deleted Doctor", async () => {
      const res = mockRes();
      const req = {};
      await DeleteDoctorByIdController(req, res, mockNext);
      expect(res.send).toHaveBeenCalledWith("Deleted Doctor");
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {};
      const error = new Error("fail");
      res.send.mockImplementation(() => {
        throw error;
      });

      await DeleteDoctorByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
