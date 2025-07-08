const testimonialService = require("../../../src/services/testimonials.services");
const testimonialRepo = require("../../../src/repository/testimonials.repository");
const { redisClient } = require("../../../src/config/redis.config");
// const dbMapper = require("../../../src/utils/db-mapper.utils");
const caching = require("../../../src/utils/caching.utils");
// const Response = require("../../../src/utils/response.utils");

jest.mock("../../../src/repository/testimonials.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/utils/caching.utils");

describe("Testimonials Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTestimonials", () => {
    it("should return testimonials from cache if available", async () => {
      const cachedData = [{ id: 1, content: "Great service!" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await testimonialService.getTestimonials(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return null if no testimonials are found", async () => {
      redisClient.get.mockResolvedValue(null);
      testimonialRepo.getAllTestimonials.mockResolvedValue(null);
      const result = await testimonialService.getTestimonials(10, 0, {});
      expect(result).toBeNull();
    });
  });

  describe("getTestimonialById", () => {
    it("should return a testimonial by id from cache if available", async () => {
      const cachedData = { id: 1, content: "Great service!" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await testimonialService.getTestimonialById(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("testimonials:1");
    });

    it("should return a 404 if testimonial not found", async () => {
      redisClient.get.mockResolvedValue(null);
      testimonialRepo.getTestimonialById.mockResolvedValue(null);

      const result = await testimonialService.getTestimonialById(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createTestimonial", () => {
    it("should create a new testimonial", async () => {
      testimonialRepo.createNewTestimonial.mockResolvedValue({});

      const result = await testimonialService.createTestimonial({
        userId: 1,
        patientId: 1,
        content: "Amazing!",
      });
      expect(result.statusCode).toBe(201);
    });

    it("should throw an error if repo fails", async () => {
      testimonialRepo.createNewTestimonial.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(testimonialService.createTestimonial({})).rejects.toThrow(
        "DB Error",
      );
    });
  });

  describe("approveTestimonialById", () => {
    it("should approve a testimonial", async () => {
      testimonialRepo.getTestimonialById.mockResolvedValue({ id: 1 });
      testimonialRepo.approveTestimonialById.mockResolvedValue({});

      const result = await testimonialService.approveTestimonialById({
        testimonialId: 1,
        approvedBy: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if testimonial not found", async () => {
      testimonialRepo.getTestimonialById.mockResolvedValue(null);

      const result = await testimonialService.approveTestimonialById({
        testimonialId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("denyTestimonialById", () => {
    it("should deny a testimonial", async () => {
      testimonialRepo.getTestimonialById.mockResolvedValue({ id: 1 });
      testimonialRepo.denyTestimonialById.mockResolvedValue({});

      const result = await testimonialService.denyTestimonialById({
        testimonialId: 1,
        approvedBy: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if testimonial not found", async () => {
      testimonialRepo.getTestimonialById.mockResolvedValue(null);

      const result = await testimonialService.denyTestimonialById({
        testimonialId: 1,
      });
      expect(result.statusCode).toBe(404);
    });
  });
});
