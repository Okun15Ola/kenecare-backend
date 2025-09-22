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
    this.client.on("connect", () => console.log("✅ Connected to Redis"));
    this.client.on("error", (err) => console.error("❌ Redis Error:", err));
    this.client.on("reconnecting", () =>
      logger.info("♻️ Reconnecting to Redis..."),
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
            username: "imotechsl",
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
      console.error("❌ Redis GET Error:", error);
      logger.error("❌ Redis GET Error:", error);
      return null;
    }
  }

  // update default cache time to 5 mins
  async set({ key, value, expiry = 300 }) {
    try {
      await this.client.set(key, value, "EX", expiry);
    } catch (error) {
      console.error("❌ Redis SET Error:", error);
      logger.error("❌ Redis SET Error:", error);
    }
  }

  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error("❌ Redis KEYS Error:", error);
      logger.error("❌ Redis KEYS Error:", error);
      return [];
    }
  }

  async delete(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("❌ Redis DEL Error:", error);
      logger.error("❌ Redis DEL Error:", error);
      throw error;
    }
  }

  async deleteAll() {
    try {
      return await this.client.flushall("ASYNC");
    } catch (error) {
      console.error("❌ Redis DELETE ALL Error:", error);
      logger.error("❌ Redis DELETE ALL Error:", error);
      throw error;
    }
  }

  async getAllKeys(pattern = "*") {
    try {
      let cursor = "0";
      let keys = [];

      do {
        // eslint-disable-next-line no-await-in-loop
        const reply = await this.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );

        const [nextCursor, scannedKeys] = reply;
        cursor = nextCursor;
        keys = keys.concat(scannedKeys);
      } while (cursor !== "0");
      return keys;
    } catch (error) {
      console.error("❌ Redis SCAN Error:", error);
      logger.error("❌ Redis SCAN Error:", error);
      throw error;
    }
  }

  async clearCacheByPattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.unlink(...keys); // More efficient than DEL for large sets
        console.log(
          `🗑️ Cleared ${keys.length} keys matching pattern "${pattern}"`,
        );
        logger.info(
          `🗑️ Cleared ${keys.length} keys matching pattern "${pattern}"`,
        );
      }
    } catch (error) {
      console.error("❌ Redis Clear Cache Error:", error);
      logger.error("❌ Redis Clear Cache Error:", error);
    }
  }

  async disconnect() {
    try {
      console.log("🔌 Closing Redis connection...");
      logger.info("🔌 Closing Redis connection...");
      await this.client.quit();
      console.log("✅ Redis connection closed.");
      logger.info("✅ Redis connection closed.");
    } catch (error) {
      console.error("❌ Redis Disconnect Error:", error);
      logger.error("❌ Redis Disconnect Error:", error);
    }
  }
}

module.exports = {
  RedisClient,
  redisClient: Object.freeze(new RedisClient()),
};
