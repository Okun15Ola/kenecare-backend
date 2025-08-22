const {
  createApiKeyService,
  deactivateApiKeyService,
  extendApiKeyService,
  getAllApiKeyService,
} = require("../../../src/services/apiKey.services");
const apiKeyRepository = require("../../../src/repository/apiKey.repository");
const { generateApiKeyAndSecret } = require("../../../src/utils/auth.utils");
const { redisClient } = require("../../../src/config/redis.config");
const Response = require("../../../src/utils/response.utils");

jest.mock("../../../src/repository/apiKey.repository");
jest.mock("../../../src/utils/auth.utils");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/response.utils", () => ({
  BAD_REQUEST: jest.fn((x) => ({ status: 400, ...x })),
  INTERNAL_SERVER_ERROR: jest.fn((x) => ({ status: 500, ...x })),
  CREATED: jest.fn((x) => ({ status: 201, ...x })),
  SUCCESS: jest.fn((x) => ({ status: 200, ...x })),
}));

describe("API Key Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createApiKeyService", () => {
    it("should return BAD_REQUEST if max keys reached", async () => {
      apiKeyRepository.countActiveKeysByEnvironment.mockResolvedValueOnce({
        keyCount: 5,
      });

      const result = await createApiKeyService(
        "client1",
        "test",
        "desc",
        "dev",
      );

      expect(result.status).toBe(400);
      expect(Response.BAD_REQUEST).toHaveBeenCalled();
    });

    it("should return INTERNAL_SERVER_ERROR if insert fails", async () => {
      apiKeyRepository.countActiveKeysByEnvironment.mockResolvedValueOnce({
        keyCount: 0,
      });
      generateApiKeyAndSecret.mockResolvedValueOnce({
        apiKey: "key",
        apiSecret: "secret",
        hashedApiSecret: "hashed",
      });
      apiKeyRepository.createApiKey.mockResolvedValueOnce({ insertId: 0 });

      const result = await createApiKeyService(
        "client1",
        "test",
        "desc",
        "dev",
      );

      expect(result.status).toBe(500);
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
    });

    it("should create API key successfully", async () => {
      apiKeyRepository.countActiveKeysByEnvironment.mockResolvedValueOnce({
        keyCount: 0,
      });
      generateApiKeyAndSecret.mockResolvedValueOnce({
        apiKey: "key",
        apiSecret: "secret",
        hashedApiSecret: "hashed",
      });
      apiKeyRepository.createApiKey.mockResolvedValueOnce({ insertId: 1 });

      const result = await createApiKeyService(
        "client1",
        "test",
        "desc",
        "dev",
      );

      expect(result.status).toBe(201);
      expect(redisClient.delete).toHaveBeenCalledWith("api-keys:all");
      expect(result.data.apiKey).toBe("key");
      expect(result.data.apiSecret).toBe("secret");
    });
  });

  describe("deactivateApiKeyService", () => {
    it("should return error if no rows affected", async () => {
      apiKeyRepository.deactivateKey.mockResolvedValueOnce({ affectedRows: 0 });

      const result = await deactivateApiKeyService("uuid-123");

      expect(result.status).toBe(500);
      expect(Response.INTERNAL_SERVER_ERROR).toHaveBeenCalled();
    });

    it("should deactivate key successfully", async () => {
      apiKeyRepository.deactivateKey.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await deactivateApiKeyService("uuid-123");

      expect(result.status).toBe(200);
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Api Key Deactivated",
      });
      expect(redisClient.delete).toHaveBeenCalledWith("api-keys:all");
    });
  });

  describe("extendApiKeyService", () => {
    it("should return error if no rows updated", async () => {
      apiKeyRepository.extendKeyExpiry.mockResolvedValueOnce({
        affectedRows: 0,
      });

      const result = await extendApiKeyService("uuid-123");

      expect(result.status).toBe(500);
    });

    it("should extend key successfully", async () => {
      apiKeyRepository.extendKeyExpiry.mockResolvedValueOnce({
        affectedRows: 1,
      });

      const result = await extendApiKeyService("uuid-123");

      expect(result.status).toBe(200);
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Api Key Expiry extended",
      });
      expect(redisClient.delete).toHaveBeenCalledWith("api-keys:all");
    });
  });

  describe("getAllApiKeyService", () => {
    it("should return cached data if exists", async () => {
      redisClient.get.mockResolvedValueOnce(JSON.stringify([{ id: 1 }]));

      const result = await getAllApiKeyService();

      expect(result.status).toBe(200);
      expect(result.data).toEqual([{ id: 1 }]);
    });

    it("should return no keys found", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      apiKeyRepository.getAllApiKeys.mockResolvedValueOnce([]);

      const result = await getAllApiKeyService();

      expect(result.status).toBe(200);
      expect(result.message).toBe("No Api Keys Found.");
    });

    it("should fetch keys from db and cache them", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      apiKeyRepository.getAllApiKeys.mockResolvedValueOnce([
        { id: 1, apiKey: "key" },
      ]);

      const result = await getAllApiKeyService();

      expect(result.status).toBe(200);
      expect(redisClient.set).toHaveBeenCalled();
    });
  });
});
