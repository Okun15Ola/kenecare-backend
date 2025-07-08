/* eslint-disable class-methods-use-this */
/* eslint-disable no-constructor-return */
const Redis = require("ioredis");
const {
  redisHost,
  redisPort,
  redisPassword,
  nodeEnv,
} = require("./default.config");

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

    // if (!RedisClient.instance) {
    //   this.client = new Redis({
    //     host: redisHost,
    //     port: redisPort,
    //     password: redisPassword,
    //     // tls: {}, // Required for AWS ElastiCache
    //     retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
    //   });
    // }
    // return RedisClient.instance;
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
      console.error("❌ Redis GET Error:", error);
      return null;
    }
  }

  async set({ key, value, expiry = 3600 }) {
    try {
      await this.client.set(key, value, "EX", expiry);
    } catch (error) {
      console.error("❌ Redis SET Error:", error);
    }
  }

  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error("❌ Redis KEYS Error:", error);
      return [];
    }
  }

  async delete(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("❌ Redis DEL Error:", error);
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
      }
    } catch (error) {
      console.error("❌ Redis Clear Cache Error:", error);
    }
  }

  async disconnect() {
    try {
      console.log("🔌 Closing Redis connection...");
      await this.client.quit();
      console.log("✅ Redis connection closed.");
    } catch (error) {
      console.error("❌ Redis Disconnect Error:", error);
    }
  }
}

// Exporting a Singleton Instance
// const { redisClient } = new RedisClient();
// process.on("SIGINT", async () => {
//   await redisClient.disconnect();
//   process.exit(0);
// });

module.exports = {
  RedisClient,
  redisClient: Object.freeze(new RedisClient()),
};
