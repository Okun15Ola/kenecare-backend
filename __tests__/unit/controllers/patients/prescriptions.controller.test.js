jest.mock("../../../../src/services/patients/patients.prescriptions.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/patients/patients.prescriptions.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAppointmentPrescriptionsController,
  GetAppointmentPrescriptionController,
} = require("../../../../src/controllers/patients/prescriptions.controller");

describe("Patient Prescriptions Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: "2" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetAppointmentPrescriptionsController", () => {
    it("should return prescriptions for an appointment", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
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
});
