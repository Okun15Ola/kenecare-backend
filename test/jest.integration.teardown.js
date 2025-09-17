/* eslint-disable no-underscore-dangle */
// jest.integration.teardown.js

module.exports = async () => {
  console.log("🗑️ Tearing down test containers...");

  const mysqlConnection = global.__TEST_DB_CONNECTION__;
  const mysqlContainer = global.__TEST_MYSQL_CONTAINER__;
  const redisClient = global.__TEST_REDIS_CLIENT__;
  const redisContainer = global.__TEST_REDIS_CONTAINER__;

  try {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log("🔌 Closed MySQL database connection");
    }
    if (redisClient) {
      await redisClient.quit();
      console.log("🔴 Closed Redis client connection");
    }
    if (mysqlContainer) {
      await mysqlContainer.stop();
      console.log("🛑 MySQL container stopped");
    }
    if (redisContainer) {
      await redisContainer.stop();
      console.log("🛑 Redis container stopped");
    }
  } catch (error) {
    console.error("❌ Failed to tear down test containers:", error);
    throw error;
  }

  // Clean up global variables
  delete global.__TEST_DB_CONNECTION__;
  delete global.__TEST_MYSQL_CONTAINER__;
  delete global.__TEST_REDIS_CLIENT__;
  delete global.__TEST_REDIS_CONTAINER__;

  console.log("✅ Test containers teardown complete");
};
