jest.mock("../../../../src/services/prescriptions.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/prescriptions.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAppointmentPrescriptionsController,
  GetAppointmentPrescriptionController,
  CreatePrescriptionController,
  GetPrescriptionsController,
  UpdatePrescriptionController,
} = require("../../../../src/controllers/doctors/prescriptions.controller");

describe("Doctor Prescriptions Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      params: { id: "2" },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetPrescriptionsController", () => {
    it("should return prescriptions for the doctor", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      services.getAppointmentPrescriptions.mockResolvedValue(mockResponse);

      await GetPrescriptionsController(req, res, next);

      expect(services.getAppointmentPrescriptions).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getAppointmentPrescriptions.mockRejectedValue(error);

      await GetPrescriptionsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAppointmentPrescriptionController", () => {
    it("should return a prescription by id", async () => {
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      services.getAppointmentPrescriptionById.mockResolvedValue(mockResponse);

      await GetAppointmentPrescriptionController(req, res, next);

      expect(services.getAppointmentPrescriptionById).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getAppointmentPrescriptionById.mockRejectedValue(error);

      await GetAppointmentPrescriptionController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAppointmentPrescriptionsController", () => {
    it("should return prescriptions for an appointment", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 2 }] };
      services.getAppointmentPrescriptions.mockResolvedValue(mockResponse);

      await GetAppointmentPrescriptionsController(req, res, next);

      expect(services.getAppointmentPrescriptions).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.getAppointmentPrescriptions.mockRejectedValue(error);

      await GetAppointmentPrescriptionsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreatePrescriptionController", () => {
    it("should create a prescription", async () => {
      req.user.id = "3";
      req.body = {
        appointmentId: 4,
        diagnosis: "Flu",
        medicines: ["Med1"],
        comment: "Take rest",
      };
      const mockResponse = { statusCode: 201, data: { id: 5 } };
      services.createPrescription.mockResolvedValue(mockResponse);

      await CreatePrescriptionController(req, res, next);

      expect(services.createPrescription).toHaveBeenCalledWith({
        userId: "3",
        appointmentId: 4,
        diagnosis: "Flu",
        medicines: ["Med1"],
        comment: "Take rest",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.createPrescription.mockRejectedValue(error);

      await CreatePrescriptionController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdatePrescriptionController", () => {
    it("should update a prescription", async () => {
      req.params.id = "6";
      req.body = {
        appointmentId: 7,
        diagnosis: "Cold",
        medicines: ["Med2"],
        comment: "Drink water",
      };
      const mockResponse = { statusCode: 200, data: { id: 6 } };
      services.updatePrescriptions.mockResolvedValue(mockResponse);

      await UpdatePrescriptionController(req, res, next);

      expect(services.updatePrescriptions).toHaveBeenCalledWith({
        prescriptionId: 6,
        appointmentId: 7,
        diagnosis: "Cold",
        medicines: ["Med2"],
        comment: "Drink water",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      services.updatePrescriptions.mockRejectedValue(error);

      await UpdatePrescriptionController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
