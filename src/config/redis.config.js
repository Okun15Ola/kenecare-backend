/* eslint-disable class-methods-use-this */
/* eslint-disable no-constructor-return */
const Redis = require("ioredis");
const {
  redisHost,
  redisPort,
  redisPassword,
  nodeEnv,
} = require("./default.config");
const logger = require("../middlewares/logger.middleware");

class RedisClient {
  static instance;

  constructor() {
    if (RedisClient.instance) return RedisClient.instance;
    this.client = this.initializeClient();
    this.client.on("connect", () => console.info("✅ Connected to Redis"));
    this.client.on("error", (err) => console.error("❌ Redis Error:", err));
    this.client.on("reconnecting", () =>
      console.info("♻️ Reconnecting to Redis..."),
    );

    RedisClient.instance = this;
  }

  initializeClient() {
    if (nodeEnv === "production") {
      return new Redis.Cluster(
        [
          {
            host: redisHost,
            port: redisPort,
          },
        ],
        {
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            tls: {},
            username: "imotechsl", // store in env in production
            password: redisPassword,
          },
        },
      );
    }

    return new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error("❌ Redis GET Error:", error);
      return null;
    }
  }

  async set({ key, value, expiry = 3600 }) {
    try {
      await this.client.set(key, value, "EX", expiry);
    } catch (error) {
      logger.error("❌ Redis SET Error:", error);
    }
  }

  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error("❌ Redis KEYS Error:", error);
      return [];
    }
  }

  async delete(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error("❌ Redis DEL Error:", error);
      throw error;
    }
  }

  async clearCacheByPattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.unlink(...keys); // More efficient than DEL for large sets
        logger.info(
          `🗑️ Cleared ${keys.length} keys matching pattern "${pattern}"`,
        );
      }
    } catch (error) {
      logger.error("❌ Redis Clear Cache Error:", error);
    }
  }

  async disconnect() {
    try {
      logger.info("🔌 Closing Redis connection...");
      await this.client.quit();
      logger.info("✅ Redis connection closed.");
    } catch (error) {
      logger.error("❌ Redis Disconnect Error:", error);
    }
  }
}

module.exports = {
  RedisClient,
  redisClient: Object.freeze(new RedisClient()),
};
