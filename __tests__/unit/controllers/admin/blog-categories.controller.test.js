jest.mock("../../../../src/services/admin/blog-categories.services");
jest.mock("../../../../src/services/admin/blogs.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const blogCategoriesServices = require("../../../../src/services/admin/blog-categories.services");
const blogsServices = require("../../../../src/services/admin/blogs.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetBlogCategoriesController,
  GetBlogCategoryByIDController,
  CreateBlogCategoryController,
  UpdateBlogCategoryByIdController,
  UpdateBlogCategoryStatusController,
  DeleteBlogCategoryByIdController,
} = require("../../../../src/controllers/admin/blog-categories.controller");

describe("Blog Categories Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetBlogCategoriesController", () => {
    it("should return blog categories with correct status", async () => {
      const mockResponse = { statusCode: 200, data: ["cat1"] };
      blogCategoriesServices.getBlogCategories.mockResolvedValue(mockResponse);

      await GetBlogCategoriesController(req, res, next);

      expect(blogCategoriesServices.getBlogCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("fail");
      blogCategoriesServices.getBlogCategories.mockRejectedValue(error);

      await GetBlogCategoriesController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogCategoryByIDController", () => {
    it("should return a blog category by id", async () => {
      req.params.id = "5";
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      blogCategoriesServices.getBlogCategory.mockResolvedValue(mockResponse);

      await GetBlogCategoryByIDController(req, res, next);

      expect(blogCategoriesServices.getBlogCategory).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "5";
      const error = new Error("fail");
      blogCategoriesServices.getBlogCategory.mockRejectedValue(error);

      await GetBlogCategoryByIDController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateBlogCategoryController", () => {
    it("should create a blog category", async () => {
      req.body.name = "Tech";
      const mockResponse = { statusCode: 201, data: { name: "Tech" } };
      blogCategoriesServices.createBlogCategory.mockResolvedValue(mockResponse);

      await CreateBlogCategoryController(req, res, next);

      expect(blogCategoriesServices.createBlogCategory).toHaveBeenCalledWith(
        "Tech",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.body.name = "Tech";
      const error = new Error("fail");
      blogCategoriesServices.createBlogCategory.mockRejectedValue(error);

      await CreateBlogCategoryController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateBlogCategoryByIdController", () => {
    it("should update a blog category by id", async () => {
      req.params.id = "7";
      req.body.name = "Science";
      const mockResponse = {
        statusCode: 200,
        data: { id: 7, name: "Science" },
      };
      blogCategoriesServices.updateBlogCategory.mockResolvedValue(mockResponse);

      await UpdateBlogCategoryByIdController(req, res, next);

      expect(blogCategoriesServices.updateBlogCategory).toHaveBeenCalledWith({
        id: 7,
        name: "Science",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "7";
      req.body.name = "Science";
      const error = new Error("fail");
      blogCategoriesServices.updateBlogCategory.mockRejectedValue(error);

      await UpdateBlogCategoryByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateBlogCategoryStatusController", () => {
    it("should update blog category status", async () => {
      req.params.id = "3";
      req.query.status = "1";
      const mockResponse = { statusCode: 200, data: { id: 3, status: 1 } };
      blogCategoriesServices.updateBlogCategoryStatus.mockResolvedValue(
        mockResponse,
      );

      await UpdateBlogCategoryStatusController(req, res, next);

      expect(
        blogCategoriesServices.updateBlogCategoryStatus,
      ).toHaveBeenCalledWith({ id: 3, status: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "3";
      req.query.status = "1";
      const error = new Error("fail");
      blogCategoriesServices.updateBlogCategoryStatus.mockRejectedValue(error);

      await UpdateBlogCategoryStatusController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteBlogCategoryByIdController", () => {
    it("should delete a blog category by id", async () => {
      req.params.id = "9";
      const mockResponse = { statusCode: 200, data: { id: 9 } };
      blogsServices.deleteBlog.mockResolvedValue(mockResponse);

      await DeleteBlogCategoryByIdController(req, res, next);

      expect(blogsServices.deleteBlog).toHaveBeenCalledWith(9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle errors", async () => {
      req.params.id = "9";
      const error = new Error("fail");
      blogsServices.deleteBlog.mockRejectedValue(error);

      await DeleteBlogCategoryByIdController(req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
