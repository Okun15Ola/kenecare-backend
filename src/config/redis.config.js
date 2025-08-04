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
      console.log("♻️ Reconnecting to Redis..."),
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

  // async clearCacheByPattern(pattern) {
  //   try {
  //     const keys = await this.keys(pattern);
  //     if (keys.length > 0) {
  //       await this.client.unlink(...keys); // More efficient than DEL for large sets
  //       console.log(
  //         `🗑️ Cleared ${keys.length} keys matching pattern "${pattern}"`,
  //       );
  //       logger.info(
  //         `🗑️ Cleared ${keys.length} keys matching pattern "${pattern}"`,
  //       );
  //     }
  //   } catch (error) {
  //     console.error("❌ Redis Clear Cache Error:", error);
  //     logger.error("❌ Redis Clear Cache Error:", error);
  //   }
  // }

  async clearCacheByPattern(pattern) {
    try {
      if (!pattern || typeof pattern !== "string") {
        throw new Error("Pattern must be a non-empty string");
      }

      const stream = this.client.scanStream({
        match: pattern,
        count: 100, // Adjust as needed
      });

      const keysToDelete = [];

      stream.on("data", (resultKeys) => {
        if (resultKeys.length) {
          keysToDelete.push(...resultKeys);
        }
      });

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      if (keysToDelete.length > 0) {
        // Delete in chunks to avoid exceeding argument limits
        const chunkSize = 500;
        const unlinkPromises = [];
        for (let i = 0; i < keysToDelete.length; i += chunkSize) {
          const chunk = keysToDelete.slice(i, i + chunkSize);
          unlinkPromises.push(this.client.unlink(...chunk));
        }
        await Promise.all(unlinkPromises);

        console.log(
          `🗑️ Cleared ${keysToDelete.length} keys matching "${pattern}"`,
        );
        logger.info(
          `🗑️ Cleared ${keysToDelete.length} keys matching "${pattern}"`,
        );
      } else {
        console.log(`⚠️ No keys matched pattern "${pattern}"`);
        logger.info(`⚠️ No keys matched pattern "${pattern}"`);
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
