const feedbackService = require("../../../../src/services/patients/appointment-feedback.services");
const feedbackRepository = require("../../../../src/repository/appointmentFeedbacks.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const Response = require("../../../../src/utils/response.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const {
  mapAppointmentFeedback,
} = require("../../../../src/utils/db-mapper.utils");

jest.mock("../../../../src/repository/appointmentFeedbacks.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("Appointment Feedback Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addAppointmentFeedbackService", () => {
    it("should return CREATED when feedback is added successfully", async () => {
      feedbackRepository.addAppointmentFeedback.mockResolvedValue({
        insertId: 1,
      });
      Response.CREATED.mockImplementation((data) => data);

      const result = await feedbackService.addAppointmentFeedbackService(
        123,
        "Great!",
      );

      expect(result).toEqual({ message: "Feedback added successfully!" });
      expect(feedbackRepository.addAppointmentFeedback).toHaveBeenCalledWith(
        123,
        "Great!",
      );
    });

    it("should return INTERNAL_SERVER_ERROR if insertId is falsy", async () => {
      feedbackRepository.addAppointmentFeedback.mockResolvedValue({
        insertId: null,
      });
      Response.INTERNAL_SERVER_ERROR.mockImplementation((data) => data);

      const result = await feedbackService.addAppointmentFeedbackService(
        123,
        "Great!",
      );

      expect(result).toEqual({
        message: "Something went wrong. Please try again",
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it("should return CONFLICT if duplicate entry error occurs", async () => {
      const duplicateError = { code: "ER_DUP_ENTRY" };
      feedbackRepository.addAppointmentFeedback.mockRejectedValue(
        duplicateError,
      );
      Response.CONFLICT.mockImplementation((data) => data);

      const result = await feedbackService.addAppointmentFeedbackService(
        123,
        "Great!",
      );

      expect(result).toEqual({
        message: "You have already submitted feedback for this appointment",
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw other errors", async () => {
      const unknownError = new Error("DB failure");
      feedbackRepository.addAppointmentFeedback.mockRejectedValue(unknownError);

      await expect(
        feedbackService.addAppointmentFeedbackService(123, "Great!"),
      ).rejects.toThrow("DB failure");
      expect(logger.error).toHaveBeenCalledWith(
        "addAppointmentFeedbackService",
        unknownError,
      );
    });
  });

  describe("getAppointmentFeedbackService", () => {
    it("should return cached feedback if available", async () => {
      const cachedData = JSON.stringify({ feedback: "Nice" });
      redisClient.get.mockResolvedValue(cachedData);
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await feedbackService.getAppointmentFeedbackService(123);

      expect(result).toEqual({ data: { feedback: "Nice" } });
      expect(redisClient.get).toHaveBeenCalledWith("feedback:123");
      expect(feedbackRepository.getAppointmentFeedback).not.toHaveBeenCalled();
    });

    it("should fetch from DB and cache if no cached data", async () => {
      redisClient.get.mockResolvedValue(null);
      const dbData = { id: 1, feedback: "Great" };
      feedbackRepository.getAppointmentFeedback.mockResolvedValue(dbData);
      mapAppointmentFeedback.mockReturnValue({ feedback: "Great" });
      Response.SUCCESS.mockImplementation((data) => data);

      const result = await feedbackService.getAppointmentFeedbackService(123);

      expect(result).toEqual({ data: { feedback: "Great" } });
      expect(redisClient.set).toHaveBeenCalledWith({
        key: "feedback:123",
        value: JSON.stringify({ feedback: "Great" }),
        expiry: 3600,
      });
    });

    it("should return NOT_FOUND if no feedback in DB", async () => {
      redisClient.get.mockResolvedValue(null);
      feedbackRepository.getAppointmentFeedback.mockResolvedValue(null);
      Response.NOT_FOUND.mockImplementation((data) => data);

      const result = await feedbackService.getAppointmentFeedbackService(123);

      expect(result).toEqual({
        message: "No feedback found for this appointment.",
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw error if repository fails", async () => {
      const dbError = new Error("DB failure");
      redisClient.get.mockResolvedValue(null);
      feedbackRepository.getAppointmentFeedback.mockRejectedValue(dbError);

      await expect(
        feedbackService.getAppointmentFeedbackService(123),
      ).rejects.toThrow("DB failure");
      expect(logger.error).toHaveBeenCalledWith(
        "getAppointmentFeedbackService",
        dbError,
      );
    });
  });
});
