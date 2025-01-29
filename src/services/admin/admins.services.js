const dbObject = require("../../db/db.admins");
const { generateAdminJwtAccessToken } = require("../../utils/auth.utils");
const { STATUS } = require("../../utils/enum.utils");
const { hashUsersPassword } = require("../../utils/auth.utils");

exports.getAdmins = async () => {
  try {
    const rawData = await dbObject.getAllAdmins();
    return rawData;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    await dbObject.createNewAdmin(admin);

    return { message: "Admin Created Successfully", data: null };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.loginAdmin = async (admin) => {
  try {
    const { adminId, accountActive } = admin;

    dbObject.updateAdminAccountStatusById({
      id: adminId,
      status: STATUS.ACTIVE,
    });

    const accessToken = generateAdminJwtAccessToken({
      sub: adminId,
      actSts: accountActive,
    });

    return { message: "Admin Login Successful", data: accessToken };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
