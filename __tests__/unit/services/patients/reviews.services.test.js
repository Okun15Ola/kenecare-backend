const doctorReviewRepository = require("../../../../src/repository/doctorReviews.repository");
const {
  getPatientByUserId,
} = require("../../../../src/repository/patients.repository");
const { redisClient } = require("../../../../src/config/redis.config");
const Response = require("../../../../src/utils/response.utils");
const service = require("../../../../src/services/patients/reviews.services");

jest.mock("../../../../src/repository/doctorReviews.repository");
jest.mock("../../../../src/repository/patients.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils.js");
jest.mock("../../../../src/utils/response.utils", () => ({
  SUCCESS: jest.fn((x) => ({ status: 200, ...x })),
  CREATED: jest.fn((x) => ({ status: 201, ...x })),
  NOT_FOUND: jest.fn((x) => ({ status: 404, ...x })),
  CONFLICT: jest.fn((x) => ({ status: 409, ...x })),
  INTERNAL_SERVER_ERROR: jest.fn((x) => ({ status: 500, ...x })),
}));

describe("Doctor Reviews Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addDoctorReviewService", () => {
    it("should return NOT_FOUND if patient profile does not exist", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: null });

      const result = await service.addDoctorReviewService(1, 2, "Good doc");

      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return INTERNAL_SERVER_ERROR if insert fails", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      doctorReviewRepository.addDoctorReview.mockResolvedValueOnce({
        insertId: null,
      });

      const result = await service.addDoctorReviewService(1, 2, "Good doc");

      expect(result.status).toBe(500);
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
    });

    it("should return CREATED if review is added successfully", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      doctorReviewRepository.addDoctorReview.mockResolvedValueOnce({
        insertId: 123,
      });

      const result = await service.addDoctorReviewService(1, 2, "Good doc");

      expect(redisClient.delete).toHaveBeenCalledWith(
        "patient:10:doctor-reviews",
      );
      expect(result.status).toBe(201);
      expect(Response.CREATED).toHaveBeenCalled();
    });

    it("should return CONFLICT on duplicate entry", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      doctorReviewRepository.addDoctorReview.mockRejectedValueOnce({
        code: "ER_DUP_ENTRY",
      });

      const result = await service.addDoctorReviewService(1, 2, "Good doc");

      expect(result.status).toBe(409);
      expect(Response.CONFLICT).toHaveBeenCalled();
    });
  });

  describe("getPatientReviewsService", () => {
    it("should return NOT_FOUND if patient does not exist", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: null });

      const result = await service.getPatientReviewsService(1);

      expect(result.status).toBe(404);
      expect(Response.NOT_FOUND).toHaveBeenCalled();
    });

    it("should return cached data if present", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      redisClient.get.mockResolvedValueOnce(
        JSON.stringify([{ review: "cached" }]),
      );

      const result = await service.getPatientReviewsService(1);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([{ review: "cached" }]);
    });

    it("should return SUCCESS with empty array if no reviews", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      redisClient.get.mockResolvedValueOnce(null);
      doctorReviewRepository.getDoctorReviewsByPatientId.mockResolvedValueOnce(
        [],
      );

      const result = await service.getPatientReviewsService(1);

      expect(result.status).toBe(200);
      expect(result.data).toEqual([]);
    });

    it("should return SUCCESS and cache data if reviews exist", async () => {
      getPatientByUserId.mockResolvedValueOnce({ patient_id: 10 });
      redisClient.get.mockResolvedValueOnce(null);
      doctorReviewRepository.getDoctorReviewsByPatientId.mockResolvedValueOnce([
        { review_id: 1, review: "Great doc" },
      ]);

      const result = await service.getPatientReviewsService(1);

      expect(redisClient.set).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.data).toEqual(expect.any(Array));
    });
  });
});
