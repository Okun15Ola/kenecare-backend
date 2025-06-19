jest.mock("../../../../src/services/doctors/follow-ups.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const followUpServices = require("../../../../src/services/doctors/follow-ups.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  CreateAppointmentFollowUpController,
  UpdateAppointmentFollowUpController,
  DeleteAppointmentFollowUpController,
  GetAppointmentFollowUpsController,
  GetFollowUpByIdController,
} = require("../../../../src/controllers/doctors/followups.controller");

describe("FollowUps Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      user: { id: "1" },
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("CreateAppointmentFollowUpController", () => {
    it("should create a follow up and return response", async () => {
      req.body = {
        appointmentId: 2,
        followUpDate: "2024-06-01",
        followUpTime: "10:00",
        followUpReason: "Checkup",
        followUpType: "Routine",
      };
      const mockResponse = { statusCode: 201, data: { id: 1 } };
      followUpServices.createFollowUp.mockResolvedValue(mockResponse);

      await CreateAppointmentFollowUpController(req, res, next);

      expect(followUpServices.createFollowUp).toHaveBeenCalledWith({
        ...req.body,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Failed");
      followUpServices.createFollowUp.mockRejectedValue(error);

      await CreateAppointmentFollowUpController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateAppointmentFollowUpController", () => {
    it("should update a follow up and return response", async () => {
      req.params.id = "5";
      req.body = {
        appointmentId: 2,
        followUpDate: "2024-06-02",
        followUpTime: "11:00",
        followUpReason: "Review",
        followUpType: "Urgent",
      };
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      followUpServices.updateAppointmentFollowUpService.mockResolvedValue(
        mockResponse,
      );

      await UpdateAppointmentFollowUpController(req, res, next);

      expect(
        followUpServices.updateAppointmentFollowUpService,
      ).toHaveBeenCalledWith({
        followUpId: 5,
        ...req.body,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "5";
      const error = new Error("Update failed");
      followUpServices.updateAppointmentFollowUpService.mockRejectedValue(
        error,
      );

      await UpdateAppointmentFollowUpController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteAppointmentFollowUpController", () => {
    it("should delete a follow up and return response", async () => {
      req.params.id = "7";
      const mockResponse = { statusCode: 204, data: null };
      followUpServices.deleteAppointmentFollowUpService.mockResolvedValue(
        mockResponse,
      );

      await DeleteAppointmentFollowUpController(req, res, next);

      expect(
        followUpServices.deleteAppointmentFollowUpService,
      ).toHaveBeenCalledWith({
        followUpId: 7,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "7";
      const error = new Error("Delete failed");
      followUpServices.deleteAppointmentFollowUpService.mockRejectedValue(
        error,
      );

      await DeleteAppointmentFollowUpController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetAppointmentFollowUpsController", () => {
    it("should get all follow ups for an appointment", async () => {
      req.params.id = "3";
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      followUpServices.getAllAppointmentFollowupService.mockResolvedValue(
        mockResponse,
      );

      await GetAppointmentFollowUpsController(req, res, next);

      expect(
        followUpServices.getAllAppointmentFollowupService,
      ).toHaveBeenCalledWith({
        userId: 1,
        appointmentId: 3,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "3";
      const error = new Error("Fetch failed");
      followUpServices.getAllAppointmentFollowupService.mockRejectedValue(
        error,
      );

      await GetAppointmentFollowUpsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetFollowUpByIdController", () => {
    it("should get a follow up by id", async () => {
      req.params.id = "9";
      const mockResponse = { statusCode: 200, data: { id: 9 } };
      followUpServices.getFollowUpByIdService.mockResolvedValue(mockResponse);

      await GetFollowUpByIdController(req, res, next);

      expect(followUpServices.getFollowUpByIdService).toHaveBeenCalledWith({
        id: 9,
        userId: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "9";
      const error = new Error("Not found");
      followUpServices.getFollowUpByIdService.mockRejectedValue(error);

      await GetFollowUpByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
