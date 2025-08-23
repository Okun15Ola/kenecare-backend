const Response = require("../../../src/utils/response.utils");
// const logger = require("../../../src/middlewares/logger.middleware");
const apiClientRepository = require("../../../src/repository/apiClient.repository");
const { redisClient } = require("../../../src/config/redis.config");
// const dbMapper = require("../../../src/utils/db-mapper.utils");
const apiClientService = require("../../../src/services/apiClient.services");

jest.mock("../../../src/utils/response.utils");
jest.mock("../../../src/middlewares/logger.middleware");
jest.mock("../../../src/repository/apiClient.repository");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/db-mapper.utils");

describe("apiClient.services tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("createApiClientService", () => {
    it("should create api client and return SUCCESS", async () => {
      apiClientRepository.createApiClient.mockResolvedValue({ insertId: 1 });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result = await apiClientService.createApiClientService(
        "uuid",
        "web",
        "Our web test",
        "test@mqil.com",
        "12345678",
        "www.test.com",
      );

      expect(apiClientRepository.createApiClient).toHaveBeenCalled();
      expect(redisClient.delete).toHaveBeenCalledWith("api-clients:all");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Api Client Added Successfully",
      });
      expect(result).toEqual({ status: 200 });
    });

    it("should return INTERNAL_SERVER_ERROR if insertId is missing", async () => {
      apiClientRepository.createApiClient.mockResolvedValue({ insertId: null });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue({ status: 500 });

      await apiClientService.createApiClientService(
        "web",
        "Our web test",
        "test@mqil.com",
        "12345678",
        "www.test.com",
      );

      expect(apiClientRepository.createApiClient).toHaveBeenCalled();
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "Something went wrong. Please try again.",
      });
    });
  });

  describe("deleteApiClientService", () => {
    it("should delete client and return SUCCESS", async () => {
      apiClientRepository.deleteApiClient.mockResolvedValue({
        affectedRows: 1,
      });
      redisClient.delete.mockResolvedValue();
      Response.SUCCESS.mockReturnValue({ status: 200 });

      await apiClientService.deleteApiClientService("uuid-123");

      expect(apiClientRepository.deleteApiClient).toHaveBeenCalledWith(
        "uuid-123",
      );
      expect(redisClient.delete).toHaveBeenCalledWith("api-clients:all");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Api Client Deleted Successfully.",
      });
    });

    it("should return INTERNAL_SERVER_ERROR if no rows affected", async () => {
      apiClientRepository.deleteApiClient.mockResolvedValue({
        affectedRows: 0,
      });
      Response.INTERNAL_SERVER_ERROR.mockReturnValue({ status: 500 });

      await apiClientService.deleteApiClientService("uuid-123");

      expect(apiClientRepository.deleteApiClient).toHaveBeenCalled();
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalledWith({
        message: "Something went wrong. Please try again.",
      });
    });
  });

  describe("getAllApiClientService", () => {
    it("should return cached data if available", async () => {
      const cached = [{ id: 1, name: "cached-client" }];
      redisClient.get.mockResolvedValue(JSON.stringify(cached));
      Response.SUCCESS.mockReturnValue({ status: 200 });

      await apiClientService.getAllApiClientService();

      expect(redisClient.get).toHaveBeenCalledWith("api-clients:all");
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: cached });
    });

    it("should return 'No Clients Found.' if DB returns empty array", async () => {
      redisClient.get.mockResolvedValue(null);
      apiClientRepository.getApiClients.mockResolvedValue([]);
      Response.SUCCESS.mockReturnValue({ status: 200 });

      await apiClientService.getAllApiClientService();

      expect(apiClientRepository.getApiClients).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No Clients Found.",
      });
    });

    it("should fetch from DB, cache it, and return clients", async () => {
      const dbRows = [{ client_uuid: "123", name: "web-client" }];

      redisClient.get.mockResolvedValue(null);
      apiClientRepository.getApiClients.mockResolvedValue(dbRows);
      redisClient.set.mockResolvedValue();
      Response.SUCCESS.mockReturnValue({ status: 200 });

      await apiClientService.getAllApiClientService();

      expect(apiClientRepository.getApiClients).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });
});
