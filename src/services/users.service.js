const dbObject = require("../db/db.users");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const { hashUsersPassword } = require("../utils/auth.utils");
const { sendAuthTokenSMS } = require("../utils/sms.utils");
const Response = require("../utils/response.utils");

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

exports.registerNewUser = async ({
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
    await sendAuthTokenSMS({ token: vToken, mobileNumber });

    return Response.CREATED({
      message: "Account Created Successfully. Please Proceed to verification",
    });
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

exports.verifyRegistrationOTP = async ({ token, user }) => {
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
    await dbObject.updateUserVerificationStatusByToken({
      token,
      verificationStatus: VERIFICATIONSTATUS.VERIFIED,
    });

    //Generate access token
    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    //update user's active status in the database
    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    return Response.SUCCESS({
      message: "Account Verified Successfully",
      data: {
        token: accessToken,
        type: userType,
        isVerified: VERIFICATIONSTATUS.VERIFIED,
        isActive: accountActive,
      },
    });
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

    //TODO Check if the account is verified
    if (accountVerified !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has not been verified. Please Verify account and try again",
      });
    }

    //TODO check if the account has not been deactivated by admin
    if (accountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has been been disabled by system administrator. Please Contact for further instructions",
      });
    }

    //Check if 2FA is enabled on the user's account
    if (is2faEnabled === STATUS.ACTIVE) {
      //generate token for 2-factor authentication
      const token = generateVerificationToken();

      awaitdbObject.updateUserVerificationTokenById({
        userId,
        token,
      });

      // send sms notifcation with 2fa token
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({ message: "2FA Token Sent successfully" });
    }

    //Generate access token
    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    //update user's active status in the database
    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });
    //Return access token
    return Response.SUCCESS({
      message: "Logged In Successfully",
      data: {
        token: accessToken,
        type: userType,
        isVerified: accountVerified,
        isActive: accountActive,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.requestUserLoginOtp = async (user) => {
  try {
    const {
      userId,
      email,
      userType,
      accountVerified,
      accountActive,
      mobileNumber,
    } = user;

    //TODO Check if the account is verified
    if (accountVerified !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has not been verified. Please Verify account and try again",
      });
    }

    //TODO check if the account has not been deactivated by admin
    if (accountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has been been disabled by system administrator. Please Contact for further instructions",
      });
    }
    //Generate Login OTP
    const token = generateVerificationToken();

    //Update user's OTP in database
    await dbObject.updateUserVerificationTokenById({
      userId,
      token,
    });

    //send sms with generated token
    await sendAuthTokenSMS({ token, mobileNumber });

    //return response to user
    return Response.SUCCESS({ message: "Login OTP Sent successfully" });
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
      await sendAuthTokenSMS({ token, mobileNumber });
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

exports.resendVerificationOTP = async ({ phoneNumber, user }) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({ message: "Error Resending OTP" });
    }
    const {
      verification_token: token,
      is_verified,
      mobile_number: mobileNumber,
    } = user;

    if (token && is_verified !== STATUS.ACTIVE) {
      // Send TOKEN VIA SMS
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({
        message: "Verification OTP resent succesfully",
      });
    } else {
      return Response.NOT_MODIFIED();
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.sendVerificationOTP = async (userId) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({ message: "Error Sending OTP" });
    }

    const user = await d
    const {
      is_verified,
      is_account_active,
      mobile_number: mobileNumber,
    } = user;

    return;
    if (is_verified && is_account_active) {
      const token = generateVerificationToken();
      // Send TOKEN VIA SMS
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({
        message: "Verification OTP sent succesfully",
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.verifyRequestedOTP = async ({ phoneNumber, user }) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({ message: "Error Resending OTP" });
    }
    const {
      verification_token: token,
      is_verified,
      mobile_number: mobileNumber,
    } = user;

    if (token && is_verified !== STATUS.ACTIVE) {
      // Send TOKEN VIA SMS
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({
        message: "Verification OTP resent succesfully",
      });
    } else {
      return Response.NOT_MODIFIED();
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
