const { v4: uuidv4 } = require("uuid");
const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");
const apiClientRepository = require("../repository/apiClient.repository");
const { redisClient } = require("../config/redis.config");
const { mapApiClientsRow } = require("../utils/db-mapper.utils");

exports.createApiClientService = async (
  clientName,
  description,
  email,
  phone,
  website,
) => {
  try {
    const clientUuid = uuidv4();
    const { insertId } = await apiClientRepository.createApiClient(
      clientUuid,
      clientName,
      description,
      email,
      phone,
      website,
    );

    if (!insertId) {
      logger.error("Fail to add new api client");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again.",
      });
    }

    await redisClient.delete("api-clients:all");
    return Response.SUCCESS({ message: "Api Client Added Successfully" });
  } catch (error) {
    logger.error("createApiClientService: ", error);
    throw error;
  }
};

exports.deleteApiClientService = async (clientUuid) => {
  try {
    const { affectedRows } =
      await apiClientRepository.deleteApiClient(clientUuid);

    if (!affectedRows || affectedRows < 1) {
      return Response.INTERNAL_SERVER_ERROR({
        message: "Something went wrong. Please try again.",
      });
    }

    await redisClient.delete("api-clients:all");
    return Response.SUCCESS({ message: "Api Client Deleted Successfully." });
  } catch (error) {
    logger.error("deleteApiClientService: ", error);
    throw error;
  }
};

exports.getAllApiClientService = async () => {
  try {
    const cachekey = "api-clients:all";
    const cachedData = await redisClient.get(cachekey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }

    const data = await apiClientRepository.getApiClients();

    if (!data?.length) {
      return Response.SUCCESS({
        message: "No Clients Found.",
      });
    }

    const clients = data.map(mapApiClientsRow);

    await redisClient.set({
      key: cachekey,
      value: JSON.stringify(clients),
    });
    return Response.SUCCESS({ clients });
  } catch (error) {
    logger.error("getAllApiClientService: ", error);
    throw error;
  }
};
