jest.mock("../../../../src/services/testimonials.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const services = require("../../../../src/services/testimonials.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetTestimonialsController,
  GetTestimonialByIDController,
  ApproveTestimonialController,
  DenyTestimonialController,
  CreateTestimonialController,
  UpdateTestimonialByIdController,
  DeleteTestimonialByIdController,
} = require("../../../../src/controllers/admin/testimonials.controller");

describe("Testimonials Admin Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetTestimonialsController", () => {
    it("should return testimonials with correct status", async () => {
      const mockResponse = { statusCode: 200, data: [] };
      services.getTestimonials.mockResolvedValue(mockResponse);

      await GetTestimonialsController(req, res, next);

      expect(services.getTestimonials).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("fail");
      services.getTestimonials.mockRejectedValue(error);

      await GetTestimonialsController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetTestimonialByIDController", () => {
    it("should return testimonial by id", async () => {
      req.params.id = "5";
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      services.getTestimonialById.mockResolvedValue(mockResponse);

      await GetTestimonialByIDController(req, res, next);

      expect(services.getTestimonialById).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "5";
      const error = new Error("fail");
      services.getTestimonialById.mockRejectedValue(error);

      await GetTestimonialByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("ApproveTestimonialController", () => {
    it("should approve testimonial", async () => {
      req.params.id = "10";
      req.user.id = 2;
      const mockResponse = { statusCode: 200, data: { id: 10 } };
      services.approveTestimonialById.mockResolvedValue(mockResponse);

      await ApproveTestimonialController(req, res, next);

      expect(services.approveTestimonialById).toHaveBeenCalledWith({
        testimonialId: 10,
        approvedBy: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "10";
      req.user.id = 2;
      const error = new Error("fail");
      services.approveTestimonialById.mockRejectedValue(error);

      await ApproveTestimonialController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DenyTestimonialController", () => {
    it("should deny testimonial", async () => {
      req.params.id = "11";
      req.user.id = 3;
      const mockResponse = { statusCode: 200, data: { id: 11 } };
      services.denyTestimonialById.mockResolvedValue(mockResponse);

      await DenyTestimonialController(req, res, next);

      expect(services.denyTestimonialById).toHaveBeenCalledWith({
        testimonialId: 11,
        approvedBy: 3,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "11";
      req.user.id = 3;
      const error = new Error("fail");
      services.denyTestimonialById.mockRejectedValue(error);

      await DenyTestimonialController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateTestimonialController", () => {
    it("should create testimonial", async () => {
      req.user.id = 4;
      req.body = { patientId: 7, content: "Great!" };
      const mockResponse = { statusCode: 201, data: { id: 20 } };
      services.createTestimonial.mockResolvedValue(mockResponse);

      await CreateTestimonialController(req, res, next);

      expect(services.createTestimonial).toHaveBeenCalledWith({
        userId: 4,
        patientId: 7,
        content: "Great!",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.user.id = 4;
      req.body = { patientId: 7, content: "Great!" };
      const error = new Error("fail");
      services.createTestimonial.mockRejectedValue(error);

      await CreateTestimonialController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateTestimonialByIdController", () => {
    it("should send 200 status", async () => {
      await UpdateTestimonialByIdController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      res.sendStatus.mockImplementation(() => {
        throw new Error("fail");
      });
      await UpdateTestimonialByIdController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("DeleteTestimonialByIdController", () => {
    it("should send 200 status", async () => {
      await DeleteTestimonialByIdController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it("should handle errors", async () => {
      res.sendStatus.mockImplementation(() => {
        throw new Error("fail");
      });
      await DeleteTestimonialByIdController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
