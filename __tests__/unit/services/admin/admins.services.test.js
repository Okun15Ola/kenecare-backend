const adminService = require("../../../../src/services/admin/admins.services");
const adminRepo = require("../../../../src/repository/admins.repository");
const authUtils = require("../../../../src/utils/auth.utils");

jest.mock("../../../../src/repository/admins.repository");
jest.mock("../../../../src/utils/auth.utils");

describe("Admins Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdmins", () => {
    it("should return a list of admins", async () => {
      const admins = [{ id: 1, fullname: "Admin User" }];
      adminRepo.getAllAdmins.mockResolvedValue(admins);

      const result = await adminService.getAdmins();
      expect(result).toEqual(admins);
    });

    it("should throw an error if repo fails", async () => {
      adminRepo.getAllAdmins.mockRejectedValue(new Error("DB Error"));
      await expect(adminService.getAdmins()).rejects.toThrow("DB Error");
    });
  });

  describe("getAdminById", () => {
    it("should return an admin by id", async () => {
      const admin = { admin_id: 1, fullname: "Admin User" };
      adminRepo.getAdminById.mockResolvedValue(admin);

      const result = await adminService.getAdminById(1);
      expect(result.adminId).toBe(1);
    });

    it("should return null if admin not found", async () => {
      adminRepo.getAdminById.mockResolvedValue(null);
      const result = await adminService.getAdminById(1);
      expect(result).toBeNull();
    });
  });

  describe("createAdmin", () => {
    it("should create a new admin", async () => {
      authUtils.hashUsersPassword.mockResolvedValue("hashed_password");
      adminRepo.createNewAdmin.mockResolvedValue({});

      const result = await adminService.createAdmin({ password: "password" });
      expect(result.message).toBe("Admin Created Successfully");
    });

    it("should throw an error if repo fails", async () => {
      authUtils.hashUsersPassword.mockResolvedValue("hashed_password");
      adminRepo.createNewAdmin.mockRejectedValue(new Error("DB Error"));
      await expect(
        adminService.createAdmin({ password: "password" }),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("loginAdmin", () => {
    it("should login an admin and return an access token", async () => {
      const admin = { adminId: 1, accountActive: 1 };
      authUtils.generateAdminJwtAccessToken.mockReturnValue("access_token");

      const result = await adminService.loginAdmin(admin);
      expect(result.data).toBe("access_token");
    });

    it("should throw an error if token generation fails", async () => {
      const admin = { adminId: 1, accountActive: 1 };
      authUtils.generateAdminJwtAccessToken.mockImplementation(() => {
        throw new Error("Token Error");
      });
      await expect(adminService.loginAdmin(admin)).rejects.toThrow(
        "Token Error",
      );
    });
  });
});
