const { v4: uuidv4 } = require("uuid");
const he = require("he");
const moment = require("moment");
const faqRepository = require("../../repository/faqs.repository");
const { redisClient } = require("../../config/redis.config");
const logger = require("../../middlewares/logger.middleware");
const Response = require("../../utils/response.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getFaqs = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider("faqs:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }
    const rawData = await faqRepository.getAllFaqs(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No faq found", data: [] });
    }

    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const faqs = rawData.map((faq) => ({
      id: faq.faq_uuid,
      question: he.decode(faq.question),
      answer: he.decode(faq.answer),
      category: faq.category || "Uncategorized",
      published: faq.is_published === 1,
      createdAt: moment(faq.created_at).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(faq.updated_at).format("YYYY-MM-DD HH:mm:ss"),
    }));

    const valueToCache = {
      data: faqs,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
      expiry: 86400,
    });
    return Response.SUCCESS({ data: faqs, pagination: paginationInfo });
  } catch (error) {
    logger.error("getFaqs", error);
    throw error;
  }
};

exports.createFaq = async ({ question, answer, category, isPublished }) => {
  try {
    const faqUuid = uuidv4();
    const { insertId } = await faqRepository.createNewFaq({
      faqUuid,
      question,
      answer,
      category,
      isPublished,
    });

    if (!insertId) {
      logger.error("Fail to insert FAQ");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await Promise.all([
      redisClient.clearCacheByPattern("faqs:all:*"),
      redisClient.clearCacheByPattern("faqs:published:*"),
    ]);

    return Response.CREATED({ message: "Faq Created Successfully." });
  } catch (error) {
    logger.error("createFaq: ", error);
    throw error;
  }
};

exports.updateFaq = async ({
  faqUuid,
  question,
  answer,
  category,
  isPublished,
}) => {
  try {
    const { affectedRows } = await faqRepository.updateFaqByUuid({
      faqUuid,
      question,
      answer,
      category,
      isPublished,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update FAQ");
      return Response.NOT_MODIFIED();
    }

    await Promise.all([
      redisClient.clearCacheByPattern("faqs:all:*"),
      redisClient.clearCacheByPattern("faqs:published:*"),
    ]);

    return Response.SUCCESS({ message: "Faq Updated Successfully." });
  } catch (error) {
    logger.error("updateFaq: ", error);
    throw error;
  }
};

exports.publishFaq = async (faqUuid) => {
  try {
    const { affectedRows } = await faqRepository.publishFaq(faqUuid);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to publish FAQ");
      return Response.NOT_MODIFIED();
    }

    await Promise.all([
      redisClient.clearCacheByPattern("faqs:all:*"),
      redisClient.clearCacheByPattern("faqs:published:*"),
    ]);

    return Response.SUCCESS({ message: "Faq Published Successfully." });
  } catch (error) {
    logger.error("publishFaq: ", error);
    throw error;
  }
};

exports.unPublishFaq = async (faqUuid) => {
  try {
    const { affectedRows } = await faqRepository.unpublishFaq(faqUuid);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to unpublish FAQ");
      return Response.NOT_MODIFIED();
    }

    await Promise.all([
      redisClient.clearCacheByPattern("faqs:all:*"),
      redisClient.clearCacheByPattern("faqs:published:*"),
    ]);

    return Response.SUCCESS({ message: "Faq Unpublished Successfully." });
  } catch (error) {
    logger.error("unpublishFaq: ", error);
    throw error;
  }
};

exports.deleteFaq = async (faqUuid) => {
  try {
    const { affectedRows } = await faqRepository.deleteFaqByUuid(faqUuid);

    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to delete FAQ");
      return Response.NOT_MODIFIED();
    }

    await Promise.all([
      redisClient.clearCacheByPattern("faqs:all:*"),
      redisClient.clearCacheByPattern("faqs:published:*"),
    ]);

    return Response.SUCCESS({ message: "Faq Deleted Successfully." });
  } catch (error) {
    logger.error("deleteFaq: ", error);
    throw error;
  }
};
