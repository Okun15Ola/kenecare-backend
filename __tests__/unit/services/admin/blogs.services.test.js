const blogsService = require("../../../../src/services/admin/blogs.services");
const blogsRepo = require("../../../../src/repository/blogs.repository");
const awsS3 = require("../../../../src/utils/aws-s3.utils");
const fileUpload = require("../../../../src/utils/file-upload.utils");
const redisClient = require("../../../../src/config/redis.config");
// const dbMapper = require("../../../../src/utils/db-mapper.utils");
const caching = require("../../../../src/utils/caching.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/blogs.repository");
jest.mock("../../../../src/utils/aws-s3.utils");
jest.mock("../../../../src/utils/file-upload.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

describe("Blogs Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBlogs", () => {
    it("should return blogs from cache if available", async () => {
      const cachedData = [{ id: 1, title: "My First Blog" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await blogsService.getBlogs(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should return a 404 if no blogs are found", async () => {
      redisClient.get.mockResolvedValue(null);
      blogsRepo.getAllBlogs.mockResolvedValue(null);

      const result = await blogsService.getBlogs(10, 0, {});
      expect(result.statusCode).toBe(404);
    });
  });

  describe("getBlog", () => {
    it("should return a blog by id from cache if available", async () => {
      const cachedData = { id: 1, title: "My First Blog" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await blogsService.getBlog(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("blogs:1");
    });

    it("should return a 404 if blog not found", async () => {
      redisClient.get.mockResolvedValue(null);
      blogsRepo.getBlogById.mockResolvedValue(null);

      const result = await blogsService.getBlog(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createBlog", () => {
    it("should create a new blog", async () => {
      const file = { buffer: "buffer", mimetype: "image/png" };
      fileUpload.generateFileName.mockReturnValue("file-name");
      awsS3.uploadFileToS3Bucket.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });
      blogsRepo.createNewBlog.mockResolvedValue({});

      const result = await blogsService.createBlog({ file });
      expect(result.statusCode).toBe(201);
    });

    it("should return a 400 if no file is provided", async () => {
      const result = await blogsService.createBlog({ file: null });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("updateBlog", () => {
    it("should update a blog", async () => {
      blogsRepo.getBlogById.mockResolvedValue({ id: 1 });
      blogsRepo.updateBlogById.mockResolvedValue({});

      const result = await blogsService.updateBlog({ id: 1 });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if blog not found", async () => {
      blogsRepo.getBlogById.mockResolvedValue(null);

      const result = await blogsService.updateBlog({ id: 1 });
      expect(result.statusCode).toBe(404);
    });
  });

  describe("deleteBlog", () => {
    it("should delete a blog", async () => {
      blogsRepo.getBlogById.mockResolvedValue({ id: 1 });
      blogsRepo.deleteBlogById.mockResolvedValue({});

      const result = await blogsService.deleteBlog(1);
      expect(result.statusCode).toBe(200);
    });

    it("should return a 404 if blog not found", async () => {
      blogsRepo.getBlogById.mockResolvedValue(null);

      const result = await blogsService.deleteBlog(1);
      expect(result.statusCode).toBe(404);
    });
  });
});
