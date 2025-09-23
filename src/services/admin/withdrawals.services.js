const Response = require("../../utils/response.utils");
const {
  getAllWithdrawalRequests,
  getWithdrawalRequestByTransactionId,
} = require("../../repository/withdrawal-requests.repository");
const { mapWithdawalRow } = require("../../utils/db-mapper.utils");
const logger = require("../../middlewares/logger.middleware");
const { getPaginationInfo } = require("../../utils/caching.utils");

exports.getAllRequests = async (limit, page) => {
  try {
    const offset = (page - 1) * limit;

    const rawData = await getAllWithdrawalRequests(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({
        message: "No withdrawal requests found",
        data: [],
      });
    }
    const { totalRows } = rawData[0];
    const paginationInfo = getPaginationInfo({ totalRows, limit, page });
    const data = rawData.map(mapWithdawalRow);
    return Response.SUCCESS({ data, pagination: paginationInfo });
  } catch (error) {
    logger.error("getAllRequests: ", error);
    throw error;
  }
};

exports.getRequestById = async (id) => {
  try {
    const rawData = await getWithdrawalRequestByTransactionId(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Withdrawal request not found" });
    }
    const data = mapWithdawalRow(rawData);
    return Response.SUCCESS({ data });
  } catch (error) {
    logger.error("getRequestById: ", error);
    throw error;
  }
};
