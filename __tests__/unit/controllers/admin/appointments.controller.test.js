jest.mock("../../../../src/services/admin/admin.appointments.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/admin/admin.appointments.services");
const logger = require("../../../../src/middlewares/logger.middleware");
const {
  GetAdminAppointmentsController,
  GetAdminAppointmentByIdController,
  GetAdminAppointmentsByDoctorIdController,
} = require("../../../../src/controllers/admin/appointments.controller");

describe("Admin Appointments Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAdminAppointmentsController", () => {
    it("should return appointments with correct status", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      services.getAdminAppointments.mockResolvedValue(mockResponse);

      await GetAdminAppointmentsController(req, res, next);

      expect(services.getAdminAppointments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test error");
      services.getAdminAppointments.mockRejectedValue(error);

      await GetAdminAppointmentsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAdminAppointmentByIdController", () => {
    it("should return appointment by id with correct status", async () => {
      const mockResponse = { statusCode: 200, data: { id: 1 } };
      services.getAdminAppointmentById.mockResolvedValue(mockResponse);

      await GetAdminAppointmentByIdController(req, res, next);

      expect(services.getAdminAppointmentById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test error");
      services.getAdminAppointmentById.mockRejectedValue(error);

      await GetAdminAppointmentByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAdminAppointmentsByDoctorIdController", () => {
    it("should return appointments by doctor id with correct status", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1, doctorId: 1 }] };
      services.getAdminAppointmentsByDoctorId.mockResolvedValue(mockResponse);

      await GetAdminAppointmentsByDoctorIdController(req, res, next);

      expect(services.getAdminAppointmentsByDoctorId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test error");
      services.getAdminAppointmentsByDoctorId.mockRejectedValue(error);

      await GetAdminAppointmentsByDoctorIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
