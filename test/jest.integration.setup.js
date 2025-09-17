/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const { MySqlContainer } = require("@testcontainers/mysql");
const { RedisContainer } = require("@testcontainers/redis");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const Redis = require("ioredis");

let mysqlContainer;
let redisContainer;
let mysqlConnection;
let redisClient;

module.exports = async () => {
  console.log("🚀 Setting up test containers...");

  try {
    // --- MySQL Container Setup ---
    console.log("Starting MySQL container...");
    mysqlContainer = await new MySqlContainer("mysql:8.0")
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: "test_password",
        MYSQL_DATABASE: "test_kenecare_db",
        MYSQL_USER: "test_user",
        MYSQL_PASSWORD: "test_password",
      })
      .start();

    const mysqlHost = mysqlContainer.getHost();
    const mysqlPort = mysqlContainer.getMappedPort(3306);

    process.env.DB_HOST = mysqlHost;
    process.env.DB_PORT = mysqlPort.toString();
    process.env.DB_USER = "test_user";
    process.env.DB_PASSWORD = "test_password";
    process.env.DB_NAME = "test_kenecare_db";

    console.log(`📦 MySQL container started on ${mysqlHost}:${mysqlPort}`);

    // Create MySQL database connection with retry
    let mysqlConnected = false;
    let mysqlAttempts = 0;
    const maxAttempts = 10;
    const retryDelay = 1000; // 1 second

    while (!mysqlConnected && mysqlAttempts < maxAttempts) {
      try {
        mysqlConnection = await mysql.createConnection({
          host: mysqlHost,
          port: mysqlPort,
          user: "test_user",
          password: "test_password",
          database: "test_kenecare_db",
          multipleStatements: true,
        });
        mysqlConnected = true;
        console.log("📊 Connected to test MySQL database");
      } catch (err) {
        mysqlAttempts += 1;
        console.warn(
          `MySQL connection attempt ${mysqlAttempts} failed. Retrying in ${retryDelay / 1000}s...`,
          err,
        );
        await new Promise((resolve) => {
          setTimeout(resolve, retryDelay);
        });
      }
    }

    if (!mysqlConnected) {
      throw new Error(
        "Failed to connect to MySQL container after multiple attempts.",
      );
    }

    // Run database migrations/setup
    await setupDatabase(mysqlConnection);

    // --- Redis Container Setup ---
    console.log("Starting Redis container...");
    redisContainer = await new RedisContainer("redis:latest").start(); // Use latest Redis
    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379);

    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = redisPort.toString();
    try {
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        maxRetriesPerRequest: null,
      });
      await redisClient.ping();
      console.log(`📡 Connected to test Redis on ${redisHost}:${redisPort}`);
    } catch (redisErr) {
      console.warn(
        `Could not connect to Redis at ${redisHost}:${redisPort}:`,
        redisErr.message,
      );
    }

    // --- General Environment Variables ---
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test_jwt_secret";

    // Store connections globally for tests and teardown
    global.__TEST_DB_CONNECTION__ = mysqlConnection;
    global.__TEST_MYSQL_CONTAINER__ = mysqlContainer;
    global.__TEST_REDIS_CLIENT__ = redisClient;
    global.__TEST_REDIS_CONTAINER__ = redisContainer;

    console.log("✅ Test containers setup complete");
  } catch (error) {
    console.error("❌ Failed to setup test containers:", error);
    if (mysqlContainer) {
      await mysqlContainer.stop();
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
    if (redisClient) {
      await redisClient.quit();
    }
    throw error;
  }
};

// Setup database schema and initial data
async function setupDatabase(connection) {
  console.log("📋 Setting up database schema...");
  try {
    const schemaPath = path.join(
      __dirname,
      "../sql-scripts/01_create_tables.sql",
    );
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      const cleanSchema = schema.replace(/USE\s+[^;]+;/gi, "");
      await connection.query(cleanSchema);
      console.log("✅ Database schema created");
    } else {
      console.warn(
        `⚠️ Schema file not found: ${schemaPath}. Skipping schema setup.`,
      );
    }

    await insertTestData(connection);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
}

async function insertTestData(connection) {
  console.log("⚙️ Inserting test data...");
  try {
    await connection.execute(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      [
        "test-user-123",
        "John Doe",
        "john.doe@example.com",
        "hashedpassword123",
      ],
    );
    await connection.execute(
      "INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)",
      ["prod-001", "Test Product A", "Description for A", 10.5, 100],
    );
    await connection.execute(
      "INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)",
      ["prod-002", "Test Product B", "Description for B", 25.0, 50],
    );
    console.log("✅ Test data inserted");
  } catch (error) {
    console.error("❌ Failed to insert test data:", error);
    throw error;
  }
}
