jest.mock("../../../../src/services/doctors/doctor.appointments.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/doctors/doctor.appointments.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetDoctorAppointmentsController,
  GetDoctorAppointmentsByIDController,
  ApproveDoctorAppointmentController,
  CancelDoctorAppointmentController,
  PostponeDoctorAppointmentController,
  StartDoctorAppointmentController,
  EndDoctorAppointmentController,
} = require("../../../../src/controllers/doctors/appointments.controller");

describe("Doctor Appointments Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetDoctorAppointmentsController", () => {
    it("should return appointments by date range if startDate and endDate are present", async () => {
      const req = {
        query: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          limit: 10,
          page: 1,
        },
        user: { id: 1 },
      };
      const userId = req.user.id;
      const mockResponse = { statusCode: 200, data: [] };
      services.getDoctorAppointmentByDateRange.mockResolvedValue(mockResponse);

      await GetDoctorAppointmentsController(req, res, next);

      expect(services.getDoctorAppointmentByDateRange).toHaveBeenCalledWith({
        userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit,
        page: req.query.page,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return all appointments if no date range", async () => {
      const req = {
        query: { limit: 10, page: 1 },
        user: { id: 1 },
      };
      const userId = req.user.id;
      const mockResponse = { statusCode: 200, data: [] };
      services.getDoctorAppointments.mockResolvedValue(mockResponse);

      await GetDoctorAppointmentsController(req, res, next);

      expect(services.getDoctorAppointments).toHaveBeenCalledWith({
        userId,
        limit: req.query.limit,
        page: req.query.page,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const req = {
        query: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          limit: 10,
          page: 1,
        },
        user: { id: 1 },
      };
      services.getDoctorAppointmentByDateRange.mockRejectedValue(error);

      await GetDoctorAppointmentsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorAppointmentsByIDController", () => {
    it("should return appointment by id", async () => {
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.getDoctorAppointment.mockResolvedValue(mockResponse);

      await GetDoctorAppointmentsByIDController(req, res, next);

      expect(services.getDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        id: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getDoctorAppointment.mockRejectedValue(error);

      await GetDoctorAppointmentsByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("ApproveDoctorAppointmentController", () => {
    it("should approve appointment", async () => {
      const mockResponse = { statusCode: 200, data: {} };
      services.approveDoctorAppointment.mockResolvedValue(mockResponse);

      await ApproveDoctorAppointmentController(req, res, next);

      expect(services.approveDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        appointmentId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.approveDoctorAppointment.mockRejectedValue(error);

      await ApproveDoctorAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CancelDoctorAppointmentController", () => {
    it("should cancel appointment", async () => {
      req.body = { cancelationReason: "Patient request" };
      const mockResponse = { statusCode: 200, data: {} };
      services.cancelDoctorAppointment.mockResolvedValue(mockResponse);

      await CancelDoctorAppointmentController(req, res, next);

      expect(services.cancelDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        appointmentId: 2,
        cancelReason: "Patient request",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.cancelDoctorAppointment.mockRejectedValue(error);

      await CancelDoctorAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("PostponeDoctorAppointmentController", () => {
    it("should postpone appointment", async () => {
      req.body = {
        reason: "Doctor unavailable",
        postponedDate: "2024-06-01",
        postponedTime: "10:00",
      };
      const mockResponse = { statusCode: 200, data: {} };
      services.postponeDoctorAppointment.mockResolvedValue(mockResponse);

      await PostponeDoctorAppointmentController(req, res, next);

      expect(services.postponeDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        appointmentId: 2,
        postponedDate: "2024-06-01",
        postponedTime: "10:00",
        postponedReason: "Doctor unavailable",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.postponeDoctorAppointment.mockRejectedValue(error);

      await PostponeDoctorAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("StartDoctorAppointmentController", () => {
    it("should start appointment", async () => {
      const mockResponse = { statusCode: 200, data: {} };
      services.startDoctorAppointment.mockResolvedValue(mockResponse);

      await StartDoctorAppointmentController(req, res, next);

      expect(services.startDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        appointmentId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.startDoctorAppointment.mockRejectedValue(error);

      await StartDoctorAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("EndDoctorAppointmentController", () => {
    it("should end appointment", async () => {
      const mockResponse = { statusCode: 200, data: {} };
      const req = {
        user: { id: "1" },
        params: { id: "test-uuid" },
        query: {},
        body: {},
      };
      services.endDoctorAppointment.mockResolvedValue(mockResponse);

      await EndDoctorAppointmentController(req, res, next);

      expect(services.endDoctorAppointment).toHaveBeenCalledWith({
        userId: 1,
        appointmentUuid: req.params.id,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.endDoctorAppointment.mockRejectedValue(error);

      await EndDoctorAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
