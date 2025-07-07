module.exports = {
  dbConfig: {
    host: "mock-host",
    user: "mock-user",
    password: "mock-password",
    database: "mock-db",
    port: 3306,
    connectionLimit: 10,
  },

  sessionStore: {
    mock: true,
  },

  connectionPool: {
    query: jest.fn(),
    end: jest.fn(),
  },

  query: jest.fn(),
};
