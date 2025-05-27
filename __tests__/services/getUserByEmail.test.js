require("dotenv").config({ path: "../.env.test" });
const dbObject = require("../../src/db/db.users");
const userService = require("../../src/services/users.service");

// Only mock modules specific to this test file
jest.mock("../../src/db/db.users");

describe("GetUserByEmail - Unit Tests", () => {
  const mockUserData = {
    user_id: 1,
    mobile_number: "1234567890",
    email: "test@example.com",
    user_type: "admin",
    is_verified: true,
    is_account_active: true,
    is_online: false,
    is_2fa_enabled: false,
    password: "hashedpassword",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close any open connections
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  });

  test("should return formatted user data when email exists", async () => {
    dbObject.getUserByEmail.mockResolvedValue(mockUserData);
    const result = await userService.getUserByEmail("test@example.com");

    expect(result).toEqual({
      userId: 1,
      mobileNumber: "1234567890",
      email: "test@example.com",
      userType: "admin",
      accountVerified: true,
      accountActive: true,
      isOnline: false,
      is2faEnabled: false,
      password: "hashedpassword",
    });
    expect(dbObject.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(dbObject.getUserByEmail).toHaveBeenCalledTimes(1);
  });

  test("should return null when email does not exist", async () => {
    dbObject.getUserByEmail.mockResolvedValue(null);

    const result = await userService.getUserByEmail("notfound@example.com");

    expect(result).toBeNull();
    expect(dbObject.getUserByEmail).toHaveBeenCalledWith(
      "notfound@example.com",
    );
  });

  test("should throw an error if database query fails", async () => {
    const mockError = new Error("Database connection failed");
    dbObject.getUserByEmail.mockRejectedValue(mockError);

    await expect(
      userService.getUserByEmail("test@example.com"),
    ).rejects.toThrow("Database connection failed");

    expect(dbObject.getUserByEmail).toHaveBeenCalledWith("test@example.com");
  });
});
