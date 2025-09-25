const doctorFaqRepository = require("../../repository/doctorFaqs.repository");
const { redisClient } = require("../../config/redis.config");
const logger = require("../../middlewares/logger.middleware");
const Response = require("../../utils/response.utils");
const { fetchLoggedInDoctor } = require("../../utils/helpers.utils");
const {
  cacheKeyBulider,
  getPaginationInfo,
} = require("../../utils/caching.utils");

exports.getDoctorFaqsService = async (userId, limit, page) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider(
      `doctor:${doctorId}:faq:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const data = await doctorFaqRepository.getAllDoctorFaqByDoctorId(
      doctorId,
      limit,
      offset,
    );

    if (!data?.length) {
      return Response.SUCCESS({ message: "No doctor faq found", data: [] });
    }

    const { totalRows } = data[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });

    return Response.SUCCESS({
      data,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getDoctorFaqsService: ", error);
    throw error;
  }
};

exports.getDoctorActiveFaqsService = async (userId, limit, page) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const offset = (page - 1) * limit;

    const cacheKey = cacheKeyBulider(
      `doctor:${doctorId}:faq:active:all`,
      limit,
      offset,
    );
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      const { data, pagination } = JSON.parse(cachedData);
      return Response.SUCCESS({
        data,
        pagination,
      });
    }

    const data = await doctorFaqRepository.getAllActiveDoctorFaqByDoctorId(
      doctorId,
      limit,
      offset,
    );

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No doctor active faq found",
        data: [],
      });
    }

    const { totalRows } = data[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });

    const valueToCache = {
      data,
      pagination: paginationInfo,
    };

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(valueToCache),
    });

    return Response.SUCCESS({
      data,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getDoctorActiveFaqsService: ", error);
    throw error;
  }
};

exports.getDoctorFaqByIdService = async (userId, id) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }

    const cacheKey = `doctor:${doctorId}:faq:${id}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
      });
    }

    const data = await doctorFaqRepository.getDoctorFaqById(id, doctorId);

    if (!data) {
      return Response.NOT_FOUND({ message: "Doctor faq not found" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(data),
    });

    return Response.SUCCESS({
      data,
    });
  } catch (error) {
    logger.error("getDoctorFaqByIdService: ", error);
    throw error;
  }
};

exports.createDoctorFaqService = async (userId, question, answer) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const { insertId } = await doctorFaqRepository.createDoctorFaq(
      doctorId,
      question,
      answer,
    );
    if (!insertId) {
      logger.error("Fail to add doctor faq: ");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:faq:*`);

    return Response.SUCCESS({ message: "Faq added successfully!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.error("FAQ submission failed: Duplicate entry for doctor faq.");
      logger.error("FAQ submission failed: Duplicate entry for doctor faq.");
      return Response.CONFLICT({
        message: "You have already submitted this FAQ",
      });
    }
    logger.error("createDoctorFaqService: ", error);
    throw error;
  }
};

exports.updateDoctorFaqService = async (userId, id, question, answer) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const { affectedRows } = await doctorFaqRepository.updateDoctorFaq({
      question,
      answer,
      id,
      doctorId,
    });
    if (!affectedRows || affectedRows < 1) {
      logger.error("Fail to update doctor faq: ");
      return Response.NOT_MODIFIED({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:faq:*`);

    return Response.SUCCESS({ message: "Faq updated successfully!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      console.error("FAQ submission failed: Duplicate entry for doctor faq.");
      logger.error("FAQ submission failed: Duplicate entry for doctor faq.");
      return Response.CONFLICT({
        message: "You have already submitted this FAQ",
      });
    }
    logger.error("updateDoctorFaqService: ", error);
    throw error;
  }
};

exports.updateDoctorFaqStatusService = async ({ userId, id, isActive }) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const { affectedRows } = await doctorFaqRepository.updateDoctorFaqStatus({
      isActive,
      id,
      doctorId,
    });
    if (!affectedRows || affectedRows < 0) {
      logger.error("Fail to update doctor faq status: ");
      return Response.NOT_MODIFIED({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:faq:*`);

    return Response.SUCCESS({ message: "Faq  status updated successfully!" });
  } catch (error) {
    logger.error("updateDoctorFaqStatusService: ", error);
    throw error;
  }
};

exports.deleteDoctorFaqService = async (userId, id) => {
  try {
    const { doctor_id: doctorId } = await fetchLoggedInDoctor(userId);

    if (!doctorId) {
      logger.error("Doctor not found");
      return Response.UNAUTHORIZED({
        message:
          "UnAuthorized Action. Please login as a doctor before proceeding",
      });
    }
    const { affectedRows } = await doctorFaqRepository.deleteDoctorFaqById(
      id,
      doctorId,
    );
    if (!affectedRows || affectedRows < 0) {
      logger.error("Fail to delete doctor faq: ");
      return Response.NOT_MODIFIED({
        message: "Something Went Wrong. Please Try Again.",
      });
    }

    await redisClient.clearCacheByPattern(`doctor:${doctorId}:faq:*`);

    return Response.SUCCESS({ message: "Faq deleted successfully!" });
  } catch (error) {
    logger.error("deleteDoctorFaqService: ", error);
    throw error;
  }
};
