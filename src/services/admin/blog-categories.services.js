const dbObject = require("../../repository/blog-categories.repository");
const Response = require("../../utils/response.utils");
const { redisClient } = require("../../config/redis.config");
const { mapBlogCategoryRow } = require("../../utils/db-mapper.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getBlogCategories = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;
    const cacheKey = cacheKeyBulider("blog-categories:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await dbObject.getAllBlogCategories(limit, offset);

    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No blog categories found",
        data: [],
      });
    }
    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const categories = rawData.map(mapBlogCategoryRow);

    const valueToCache = {
      data: categories,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 3600,
    });

    return Response.SUCCESS({
      data: categories,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getBlogCategories: ", error);
    throw error;
  }
};

exports.getBlogCategory = async (id) => {
  try {
    const cacheKey = `blog-categories:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getBlogCategoryById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Blog Categrory Not Found" });
    }
    const category = mapBlogCategoryRow(rawData);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(category),
      expiry: 3600,
    });
    return Response.SUCCESS({ data: category });
  } catch (error) {
    logger.error("getBlogCategory: ", error);
    throw error;
  }
};

exports.createBlogCategory = async (name) => {
  try {
    const rawData = await dbObject.getBlogCategoryByName(name);
    if (rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Name Already Exists",
      });
    }

    const category = {
      name,
      inputtedBy: 1,
    };
    const { insertId } = await dbObject.createNewBlogCategory(category);

    if (!insertId) {
      return Response.BAD_REQUEST({
        message: "Failed to create blog category",
      });
    }

    await redisClient.clearCacheByPattern("blog-categories:*");

    return Response.SUCCESS({ message: "Blog Category Created Successfully" });
  } catch (error) {
    logger.error("createBlogCategory: ", error);
    throw error;
  }
};

exports.updateBlogCategory = async ({ id, name }) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }

    const { affectedRows } = await dbObject.updateBlogCategoryById({
      id,
      name,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("blog-categories:*");
    return Response.SUCCESS({ message: "Blog Category Updated Successfully" });
  } catch (error) {
    logger.error("updateBlogCategory: ", error);
    throw error;
  }
};

exports.updateBlogCategoryStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }
    if (status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Category Status" });
    }

    const { affectedRows } = await dbObject.updateBlogCategoryStatusById({
      id,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("blog-categories:*");

    return Response.SUCCESS({
      message: "Blog Category Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateBlogCategoryStatus: ", error);
    throw error;
  }
};

exports.deleteBlogCategory = async (id) => {
  try {
    const rawData = await dbObject.getBlogCategoryById(id);
    if (!rawData) {
      return Response.BAD_REQUEST({
        message: "Blog Category Not Found",
      });
    }

    const { affectedRows } = await dbObject.deleteBlogCategoryById(id);

    if (!affectedRows || affectedRows < 1) {
      return Response.NOT_MODIFIED({});
    }

    await redisClient.clearCacheByPattern("blog-categories:*");

    return Response.SUCCESS({ message: "Blog Category Deleted Successfully" });
  } catch (error) {
    logger.error("deleteBlogCategory: ", error);
    throw error;
  }
};
