const dbObject = require("../db/db.users");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const { hashUsersPassword } = require("../utils/auth.utils");
const { sendTokenSMS } = require("../utils/sms.utils");

exports.getUsers = async () => {
  const rawData = await dbObject.getAllUsers();
  console.log(rawData);
  return new Array(5);
};

exports.getUserById = async (userId) => {
  try {
    const rawData = await dbObject.getUserById(userId);
    if (rawData) {
      const {
        user_id: userId,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_verified: accountVerified,
        is_account_active: accountActive,
        is_online: isOnline,
        is_2fa_enabled: is2faEnabled,
        password,
      } = rawData;
      return {
        userId,
        mobileNumber,
        email,
        userType,
        accountVerified,
        accountActive,
        isOnline,
        is2faEnabled,
        password: password,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByMobileNumber = async (mobileNumber) => {
  try {
    const rawData = await dbObject.getUserByMobileNumber(mobileNumber);
    if (rawData) {
      const {
        user_id: userId,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_verified: accountVerified,
        is_account_active: accountActive,
        is_online: isOnline,
        is_2fa_enabled: is2faEnabled,
        password,
      } = rawData;
      return {
        userId,
        mobileNumber,
        email,
        userType,
        accountVerified,
        accountActive,
        isOnline,
        is2faEnabled,
        password: password,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByEmail = async (email) => {
  try {
    const rawData = await dbObject.getUserByEmail(email);
    if (rawData) {
      const {
        user_id: userId,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_verified: accountVerified,
        is_account_active: accountActive,
        is_online: isOnline,
        is_2fa_enabled: is2faEnabled,
        password,
      } = rawData;
      return {
        userId,
        mobileNumber,
        email,
        userType,
        accountVerified,
        accountActive,
        isOnline,
        is2faEnabled,
        password,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createUser = async ({
  mobileNumber,
  email = "",
  password,
  userType,
}) => {
  try {
    //DONE Check user type and match with expected values
    const type = userType === "patient" ? USERTYPE.PATIENT : USERTYPE.DOCTOR;

    // has plain text password
    const hash = await hashUsersPassword(password);

    // GENERATE VERIFICATION TOKEN
    const vToken = generateVerificationToken();

    // CREATE USER OBJECT
    const user = {
      mobileNumber,
      email,
      password: hash,
      userType: type,
      vToken,
    };

    // SAVE TO DATABASE
    await dbObject.createNewUser(user);

    // Send TOKEN VIA SMS
    await sendTokenSMS({ token: vToken, mobileNumber });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByToken = async (token) => {
  try {
    const rawData = await dbObject.getUserByVerificationToken(token);
    if (rawData) {
      const {
        user_id: userId,
        mobile_number: mobileNumber,
        email,
        user_type: userType,
        is_verified: accountVerified,
        is_account_active: accountActive,
        is_online: isOnline,
        is_2fa_enabled: is2faEnabled,
      } = rawData;
      return {
        userId,
        mobileNumber,
        email,
        userType,
        accountVerified,
        accountActive,
        isOnline,
        is2faEnabled,
      };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.verifyUserAccount = async (token) => {
  try {
    await dbObject.updateUserVerificationStatusById({
      token,
      verificationStatus: VERIFICATIONSTATUS.VERIFIED,
    });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.loginUser = async (user) => {
  try {
    const {
      is2faEnabled,
      userId,
      email,
      userType,
      accountVerified,
      accountActive,
      mobileNumber,
    } = user;

    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    if (is2faEnabled === STATUS.ACTIVE) {
      //generate token for 2-factor authentication
      const token = generateVerificationToken();

      awaitdbObject.updateUserVerificationTokenById({
        userId,
        token,
      });

      // send sms notifcation with 2fa token
      await sendTokenSMS({ token, mobileNumber });
      return { message: "2FA Token Sent successfully", data: null };
    }
    const accessToken = generateUsersJwtAccessToken({
      is2faEnabled,
      userId,
      email,
      userType,
      accountVerified,
      isOnline: STATUS.ACTIVE,
      accountActive,
    });

    return { message: "Login Successful", data: accessToken };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.requestUserLoginOtp = async (user) => {
  try {
    const { userId, mobileNumber } = user;

    const token = generateVerificationToken();
    await dbObject.updateUserVerificationTokenById({
      userId,
      token,
    });
    await sendTokenSMS({ token, mobileNumber });
    return { message: "Login OTP Sent successfully", data: null };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.verifyUserLoginOtp = async (user) => {
  try {
    const {
      is2faEnabled,
      userId,
      email,
      userType,
      accountVerified,
      accountActive,
      mobileNumber,
    } = user;

    // Delete login OTP token from users account
    await dbObject.updateUserVerificationTokenById({
      userId,
      token: null,
    });

    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    if (is2faEnabled === STATUS.ACTIVE) {
      //generate token for 2-factor authentication
      const token = generateVerificationToken();

      await dbObject.updateUserVerificationTokenById({
        userId,
        token,
      });
      // send sms notifcation with 2fa token
      await sendTokenSMS({ token, mobileNumber });
      return { message: "2FA Token Sent successfully", data: null };
    }

    const accessToken = generateUsersJwtAccessToken({
      is2faEnabled,
      userId,
      email,
      userType,
      accountVerified,
      isOnline: STATUS.ACTIVE,
      accountActive,
    });

    return { message: "Login Successful", data: accessToken };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
