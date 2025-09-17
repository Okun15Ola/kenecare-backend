jest.mock("../../../../src/services/patients/patients.appointments.services");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/time.utils");

const services = require("../../../../src/services/patients/patients.appointments.services");
const logger = require("../../../../src/middlewares/logger.middleware");
const utils = require("../../../../src/utils/time.utils");

const {
  GetAppointmentsController,
  GetAppointmentsByIDController,
  CreateAppointmentController,
  UpdatePatientMedicalAppointmentByIdController,
  UpdatePatientMedicalAppointmentStatusController,
} = require("../../../../src/controllers/patients/appointments.controller");

describe("Patient Appointments Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
      query: { limit: 1, page: 10 },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAppointmentsController", () => {
    it("should return patient appointments", async () => {
      const req = {
        user: { id: 1 },
        query: { limit: 10, page: 1 },
      };
      const userId = req.user.id;
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      services.getPatientAppointments.mockResolvedValue(mockResponse);

      await GetAppointmentsController(req, res, next);

      expect(services.getPatientAppointments).toHaveBeenCalledWith(
        userId,
        req.query.limit,
        req.query.page,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      const req = {
        user: { userId: 1 },
        query: { limit: 10, page: 1 },
      };
      services.getPatientAppointments.mockRejectedValue(error);

      await GetAppointmentsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAppointmentsByIDController", () => {
    it("should return appointment by id", async () => {
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.getPatientAppointment.mockResolvedValue(mockResponse);

      await GetAppointmentsByIDController(req, res, next);

      expect(services.getPatientAppointment).toHaveBeenCalledWith({
        userId: 1,
        id: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getPatientAppointment.mockRejectedValue(error);

      await GetAppointmentsByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateAppointmentController", () => {
    it("should create a patient appointment", async () => {
      req.user.id = "3";
      req.body = {
        patientName: "John Doe",
        patientNumber: "08012345678",
        doctorId: 5,
        specialtyId: 2,
        symptoms: "Cough",
        appointmentType: "physical",
        appointmentDate: "2024-06-01",
        appointmentTime: "10:00",
      };
      utils.refineMobileNumber.mockReturnValue("+2348012345678");
      const mockResponse = { statusCode: 201, data: { id: 10 } };
      services.createPatientAppointment.mockResolvedValue(mockResponse);

      await CreateAppointmentController(req, res, next);

      expect(utils.refineMobileNumber).toHaveBeenCalledWith("08012345678");
      expect(services.createPatientAppointment).toHaveBeenCalledWith({
        userId: 3,
        patientName: "John Doe",
        patientNumber: "+2348012345678",
        appointmentType: "physical",
        doctorId: 5,
        specialtyId: 2,
        symptoms: "Cough",
        appointmentDate: "2024-06-01",
        appointmentTime: "10:00",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      utils.refineMobileNumber.mockReturnValue("+2348012345678");
      const error = new Error("Test error");
      services.createPatientAppointment.mockRejectedValue(error);

      await CreateAppointmentController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePatientMedicalAppointmentByIdController", () => {
    it("should return 200", async () => {
      await UpdatePatientMedicalAppointmentByIdController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      res.sendStatus.mockImplementation(() => {
        throw new Error("Test error");
      });
      await UpdatePatientMedicalAppointmentByIdController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("UpdatePatientMedicalAppointmentStatusController", () => {
    it("should return 200", async () => {
      await UpdatePatientMedicalAppointmentStatusController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      res.sendStatus.mockImplementation(() => {
        throw new Error("Test error");
      });
      await UpdatePatientMedicalAppointmentStatusController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
