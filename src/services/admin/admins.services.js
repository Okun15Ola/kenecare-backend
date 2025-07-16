const dbObject = require("../../repository/admins.repository");
const { generateAdminJwtAccessToken } = require("../../utils/auth.utils");
const { STATUS } = require("../../utils/enum.utils");
const { hashUsersPassword } = require("../../utils/auth.utils");
const { blacklistToken } = require("../../utils/auth.utils");
const logger = require("../../middlewares/logger.middleware");

exports.getAdmins = async () => {
  try {
    const rawData = await dbObject.getAllAdmins();
    return rawData;
  } catch (error) {
    logger.error("getAdmins: ", error);
    throw error;
  }
};

exports.getAdminById = async (id) => {
  try {
    const rawData = await dbObject.getAdminById(id);
    if (!rawData) {
      return null;
    }
    const {
      admin_id: adminId,
      mobile_number: mobileNumber,
      fullname: fullName,
      email,
      is_account_active: accountActive,
      password,
    } = rawData;
    return {
      adminId,
      mobileNumber,
      fullName,
      email,
      accountActive,
      password,
    };
  } catch (error) {
    logger.error("getAdminById: ", error);
    throw error;
  }
};
exports.getAdminByMobileNumber = async (adminMobileNumber) => {
  try {
    const rawData = await dbObject.getAdminByMobileNumber(adminMobileNumber);
    if (!rawData) {
      return null;
    }
    const {
      admin_id: adminId,
      mobile_number: mobileNumber,
      fullname: fullName,
      email,
      is_account_active: accountActive,
      password,
    } = rawData;
    return {
      adminId,
      mobileNumber,
      fullName,
      email,
      accountActive,
      password,
    };
  } catch (error) {
    logger.error("getAdminByMobileNumber: ", error);
    throw error;
  }
};
exports.getAdminByEmail = async (adminEmail) => {
  try {
    const rawData = await dbObject.getAdminByEmail(adminEmail);
    if (!rawData) return null;

    const {
      admin_id: adminId,
      mobile_number: mobileNumber,
      fullname: fullName,
      email,
      is_account_active: accountActive,
      password,
    } = rawData;
    return {
      adminId,
      mobileNumber,
      fullName,
      email,
      accountActive,
      password,
    };
  } catch (error) {
    logger.error("getAdminByEmail: ", error);
    throw error;
  }
};

exports.createAdmin = async ({ fullname, email, mobileNumber, password }) => {
  try {
    // has plain text password
    const hash = await hashUsersPassword(password);

    // CREATE USER OBJECT
    const admin = {
      fullname,
      email,
      mobileNumber,
      password: hash,
    };

    // SAVE TO DATABASE
    const { insertId } = await dbObject.createNewAdmin(admin);

    if (!insertId) {
      logger.warn("Failed to create admin");
      return Response.BAD_REQUEST({ message: "Failed to create admin" });
    }

    return { message: "Admin Created Successfully", data: null };
  } catch (error) {
    logger.error("createAdmin: ", error);
    throw error;
  }
};

exports.loginAdmin = async (admin) => {
  try {
    const { adminId, accountActive } = admin;

    const { affectedRows } = await dbObject.updateAdminAccountStatusById({
      id: adminId,
      status: STATUS.ACTIVE,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update admin account status for ID ${adminId}`);
      return Response.NOT_MODIFIED({});
    }

    const accessToken = generateAdminJwtAccessToken({
      sub: adminId,
      actSts: accountActive,
    });

    return { message: "Admin Login Successful", data: accessToken };
  } catch (error) {
    logger.error("loginAdmin: ", error);
    throw error;
  }
};

exports.logoutAdmin = async ({ token, tokenExpiry }) => {
  try {
    await blacklistToken(token, tokenExpiry);
    return { message: "Admin Logout Successful" };
  } catch (error) {
    logger.error("logoutAdmin: ", error);
    throw error;
  }
};
