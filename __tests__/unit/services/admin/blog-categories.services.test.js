/* eslint-disable no-unused-vars */
const blogCategoriesService = require("../../../../src/services/admin/blog-categories.services");
const blogCategoriesRepo = require("../../../../src/repository/blog-categories.repository");
const { redisClient } = require("../../../../src/config/redis.config");
// const dbMapper = require('../../../../src/utils/db-mapper.utils');
const caching = require("../../../../src/utils/caching.utils");
// const Response = require('../../../../src/utils/response.utils');

jest.mock("../../../../src/repository/blog-categories.repository");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/utils/caching.utils");

jest.mock("../../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn((_) => ({})),
  cacheKeyBulider: jest.fn((key) => key),
}));

describe("Blog Categories Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBlogCategories", () => {
    it("should return blog categories from cache if available", async () => {
      const cachedData = [{ id: 1, name: "Technology" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));
      caching.cacheKeyBulider.mockReturnValue("cache-key");

      const result = await blogCategoriesService.getBlogCategories(10, 0, {});
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalledWith("cache-key");
    });

    it("should throw an error if repo fails", async () => {
      redisClient.get.mockResolvedValue(null);
      blogCategoriesRepo.getAllBlogCategories.mockRejectedValue(
        new Error("DB Error"),
      );
      await expect(
        blogCategoriesService.getBlogCategories(10, 0, {}),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("getBlogCategory", () => {
    it("should return a blog category by id from cache if available", async () => {
      const cachedData = { id: 1, name: "Technology" };
      redisClient.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await blogCategoriesService.getBlogCategory(1);
      expect(result.data).toEqual(cachedData);
      expect(redisClient.get).toHaveBeenCalled();
    });

    it("should return a 404 if category not found", async () => {
      redisClient.get.mockResolvedValue(null);
      blogCategoriesRepo.getBlogCategoryById.mockResolvedValue(null);

      const result = await blogCategoriesService.getBlogCategory(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("createBlogCategory", () => {
    it("should create a new blog category", async () => {
      blogCategoriesRepo.getBlogCategoryByName.mockResolvedValue(null);
      blogCategoriesRepo.createNewBlogCategory.mockResolvedValue({
        insertId: 1,
      });

      const result = await blogCategoriesService.createBlogCategory("Health");
      expect(result.statusCode).toBe(200);
    });

    it("should return a 400 if category already exists", async () => {
      blogCategoriesRepo.getBlogCategoryByName.mockResolvedValue({
        id: 1,
        name: "Health",
      });

      const result = await blogCategoriesService.createBlogCategory("Health");
      expect(result.statusCode).toBe(400);
    });
  });

  describe("updateBlogCategory", () => {
    it("should update a blog category", async () => {
      blogCategoriesRepo.getBlogCategoryById.mockResolvedValue({ id: 1 });
      blogCategoriesRepo.updateBlogCategoryById.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await blogCategoriesService.updateBlogCategory({
        id: 1,
        name: "Fitness",
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 400 if category not found", async () => {
      blogCategoriesRepo.getBlogCategoryById.mockResolvedValue(null);

      const result = await blogCategoriesService.updateBlogCategory({ id: 1 });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("deleteBlogCategory", () => {
    it("should delete a blog category", async () => {
      blogCategoriesRepo.getBlogCategoryById.mockResolvedValue({ id: 1 });
      blogCategoriesRepo.deleteBlogCategoryById.mockResolvedValue({
        affectedRows: 1,
      });

      const result = await blogCategoriesService.deleteBlogCategory(1);
      expect(result.statusCode).toBe(200);
    });

    it("should return a 400 if category not found", async () => {
      blogCategoriesRepo.getBlogCategoryById.mockResolvedValue(null);

      const result = await blogCategoriesService.deleteBlogCategory(1);
      expect(result.statusCode).toBe(400);
    });
  });
});
