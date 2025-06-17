const patientsServices = require("../../../../src/services/patients/patients.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetPatientsController,
  GetPatientByIdController,
  GetPatientTestimonialsController,
} = require("../../../../src/controllers/admin/patients.controller");

jest.mock("../../../../src/services/patients/patients.services");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("Patients Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetPatientsController", () => {
    it("should return patients with correct status", async () => {
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      patientsServices.getAllPatients.mockResolvedValue(mockResponse);

      await GetPatientsController(req, res, next);

      expect(patientsServices.getAllPatients).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test error");
      patientsServices.getAllPatients.mockRejectedValue(error);

      await GetPatientsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetPatientByIdController", () => {
    it("should return patient by id with correct status", async () => {
      req.params.id = "5";
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      patientsServices.getPatientById.mockResolvedValue(mockResponse);

      await GetPatientByIdController(req, res, next);

      expect(patientsServices.getPatientById).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      req.params.id = "2";
      const error = new Error("Test error");
      patientsServices.getPatientById.mockRejectedValue(error);

      await GetPatientByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetPatientTestimonialsController", () => {
    it("should return testimonials with correct status", async () => {
      const mockResponse = { statusCode: 200, data: ["testimonial"] };
      patientsServices.getPatientsTestimonial.mockResolvedValue(mockResponse);

      await GetPatientTestimonialsController(req, res, next);

      expect(patientsServices.getPatientsTestimonial).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test error");
      patientsServices.getPatientsTestimonial.mockRejectedValue(error);

      await GetPatientTestimonialsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
