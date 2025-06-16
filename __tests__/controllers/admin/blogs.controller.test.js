const blogsServices = require("../../../src/services/admin/blogs.services");
const logger = require("../../../src/middlewares/logger.middleware");

const {
  GetBlogsController,
  GetBlogByIDController,
  CreateBlogController,
  UpdateBlogByIdController,
  UpdateBlogStatusController,
  DeleteBlogByIdController,
} = require("../../../src/controllers/admin/blogs.controller");

jest.mock("../../../src/services/admin/blogs.services");
jest.mock("../../../src/middlewares/logger.middleware");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Blogs Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GetBlogsController", () => {
    it("should return blogs with correct status", async () => {
      const res = mockRes();
      const req = {};
      const response = { statusCode: 200, data: [{ id: 1 }] };
      blogsServices.getBlogs.mockResolvedValue(response);

      await GetBlogsController(req, res, mockNext);

      expect(blogsServices.getBlogs).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {};
      const error = new Error("fail");
      blogsServices.getBlogs.mockRejectedValue(error);

      await GetBlogsController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogByIDController", () => {
    it("should return a blog by id", async () => {
      const res = mockRes();
      const req = { params: { id: "5" } };
      const response = { statusCode: 200, data: { id: 5 } };
      blogsServices.getBlog.mockResolvedValue(response);

      await GetBlogByIDController(req, res, mockNext);

      expect(blogsServices.getBlog).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "5" } };
      const error = new Error("fail");
      blogsServices.getBlog.mockRejectedValue(error);

      await GetBlogByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateBlogController", () => {
    it("should create a blog", async () => {
      const res = mockRes();
      const req = {
        file: { filename: "file.jpg" },
        user: { id: "2" },
        body: {
          category: "cat",
          title: "title",
          content: "content",
          tags: ["tag1", "tag2"],
          featured: true,
        },
      };
      const response = { statusCode: 201, data: { id: 1 } };
      blogsServices.createBlog.mockResolvedValue(response);

      await CreateBlogController(req, res, mockNext);

      expect(blogsServices.createBlog).toHaveBeenCalledWith({
        category: "cat",
        title: "title",
        content: "content",
        file: { filename: "file.jpg" },
        tags: JSON.stringify(["tag1", "tag2"]),
        featured: true,
        inputtedBy: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        file: null,
        user: { id: "2" },
        body: {
          category: "cat",
          title: "title",
          content: "content",
          tags: ["tag1"],
          featured: false,
        },
      };
      const error = new Error("fail");
      blogsServices.createBlog.mockRejectedValue(error);

      await CreateBlogController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateBlogByIdController", () => {
    it("should update a blog", async () => {
      const res = mockRes();
      const req = {
        file: null,
        params: { id: "3" },
        body: {
          category: "cat",
          title: "title",
          content: "content",
          tags: ["tag1"],
          featured: false,
        },
      };
      const response = { statusCode: 200, data: { id: 3 } };
      blogsServices.updateBlog.mockResolvedValue(response);

      await UpdateBlogByIdController(req, res, mockNext);

      expect(blogsServices.updateBlog).toHaveBeenCalledWith({
        id: 3,
        category: "cat",
        title: "title",
        content: "content",
        tags: JSON.stringify(["tag1"]),
        file: null,
        featured: false,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        file: null,
        params: { id: "3" },
        body: {
          category: "cat",
          title: "title",
          content: "content",
          tags: ["tag1"],
          featured: false,
        },
      };
      const error = new Error("fail");
      blogsServices.updateBlog.mockRejectedValue(error);

      await UpdateBlogByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateBlogStatusController", () => {
    it("should update blog status", async () => {
      const res = mockRes();
      const req = { params: { id: "4" }, query: { status: "1" } };
      const response = { statusCode: 200, data: { id: 4, status: 1 } };
      blogsServices.updateBlogStatus.mockResolvedValue(response);

      await UpdateBlogStatusController(req, res, mockNext);

      expect(blogsServices.updateBlogStatus).toHaveBeenCalledWith({
        id: 4,
        status: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "4" }, query: { status: "1" } };
      const error = new Error("fail");
      blogsServices.updateBlogStatus.mockRejectedValue(error);

      await UpdateBlogStatusController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteBlogByIdController", () => {
    it("should delete a blog", async () => {
      const res = mockRes();
      const req = { params: { id: "7" } };
      const response = { statusCode: 200, data: { id: 7 } };
      blogsServices.deleteBlog.mockResolvedValue(response);

      await DeleteBlogByIdController(req, res, mockNext);

      expect(blogsServices.deleteBlog).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "7" } };
      const error = new Error("fail");
      blogsServices.deleteBlog.mockRejectedValue(error);

      await DeleteBlogByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
