const dbObject = require("../db/db.admins");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
  generateAdminJwtAccessToken,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const { hashUsersPassword } = require("../utils/auth.utils");
const { sendTokenSMS } = require("../utils/sms.utils");

exports.getAdmins = async () => {
  try {
    const rawData = await dbObject.getAllAdmins();
    console.log(rawData);
    return rawData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getAdminById = async (adminId) => {
  try {
    const rawData = await dbObject.getAdminById(adminId);
    if (rawData) {
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
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getAdminByMobileNumber = async (mobileNumber) => {
  try {
    const rawData = await dbObject.getAdminByMobileNumber(mobileNumber);
    if (rawData) {
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
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getAdminByEmail = async (email) => {
  try {
    const rawData = await dbObject.getAdminByEmail(email);
    if (rawData) {
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
    }
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
    const { adminId, fullname, email, mobileNumber, accountActive } = admin;

    dbObject.updateAdminAccountStatusById({
      id: adminId,
      status: STATUS.ACTIVE,
    });

    const accessToken = generateAdminJwtAccessToken({
      adminId,
      fullname,
      mobileNumber,
      email,
      isOnline: STATUS.ACTIVE,
      accountActive,
    });

    return { message: "Admin Login Successful", data: accessToken };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
