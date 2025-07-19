const repo = require("../repository/users.repository");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
  generateAndSendVerificationOTP,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const {
  hashUsersPassword,
  blacklistAllUserTokens,
  blacklistToken,
} = require("../utils/auth.utils");
const {
  sendAuthTokenSMS,
  sendVerificationTokenSMS,
  sendPasswordResetSMS,
} = require("../utils/sms.utils");
const Response = require("../utils/response.utils");
const { generateStreamUserToken } = require("../utils/stream.utils");
const { redisClient } = require("../config/redis.config");
const { cacheKeyBulider } = require("../utils/caching.utils");
const { mapUserRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");
const { refineMobileNumber } = require("../utils/auth.utils");
const { createStreamUserProfile } = require("../utils/helpers.utils");
const {
  generateTokenExpiryTime,
  verifyTokenExpiry,
} = require("../utils/time.utils");

/**
 * Retrieves all users with pagination
 * @param {number} limit - Number of users to retrieve
 * @param {number} offset - Number of users to skip
 * @param {Object} paginationInfo - Pagination metadata
 * @returns {Promise<Object>} Response object with users data and pagination info
 */
exports.getUsers = async (limit, offset, paginationInfo) => {
  try {
    const cacheKey = cacheKeyBulider("users:all", limit, offset);
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return Response.SUCCESS({
        data: JSON.parse(cachedData),
        pagination: paginationInfo,
      });
    }

    const rawData = await repo.getAllUsers(limit, offset);
    if (!rawData?.length) {
      return Response.SUCCESS({ message: "No users found", data: [] });
    }

    const users = rawData.map(mapUserRow);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(users),
    });
    return Response.SUCCESS({
      data: users,
      pagination: paginationInfo,
    });
  } catch (error) {
    logger.error("getUsers: ", error);
    throw error;
  }
};

/**
 * Retrieves a user by their ID
 * @param {string|number} id - User ID
 * @returns {Promise<Object>} User object or not found response
 */
exports.getUserById = async (id) => {
  try {
    const cacheKey = `user:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserById(id);

    if (!rawData) {
      logger.warn("User not found for ID");
      return Response.NOT_FOUND({ message: "User not found" });
    }

    const user = mapUserRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    logger.error("getUserById: ", error);
    throw error;
  }
};

/**
 * Retrieves a user by their mobile number
 * @param {string} number - Mobile number
 * @returns {Promise<Object>} User object or not found response
 */
exports.getUserByMobileNumber = async (number) => {
  try {
    const cacheKey = `user:mobile:${number}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByMobileNumber(number);
    if (!rawData) {
      logger.warn("User not found for mobile number");
      return Response.NOT_FOUND({ message: "User not found" });
    }

    const user = mapUserRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    logger.error("getUserByMobileNumber: ", error);
    throw error;
  }
};

/**
 * Retrieves a user by their email
 * @param {string} userEmail - User email address
 * @returns {Promise<Object>} User object or not found response
 */
exports.getUserByEmail = async (userEmail) => {
  try {
    const cacheKey = `user:email:${userEmail}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByEmail(userEmail);

    if (!rawData) {
      logger.warn("User not found for email");
      return Response.NOT_FOUND({ message: "User not found" });
    }

    const user = mapUserRow(rawData, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    logger.error("getUserByEmail: ", error);
    throw error;
  }
};

/**
 * Retrieves a user by their verification token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} User object or not found response
 */
exports.getUserByToken = async (token) => {
  try {
    const cacheKey = `user:token:${token}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByVerificationToken(token);

    if (!rawData) {
      logger.warn("User not found for token");
      return Response.NOT_FOUND({ message: "User not found" });
    }

    const user = mapUserRow(rawData, false, true, true);

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    logger.error("getUserByToken: ", error);
    throw error;
  }
};

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.mobileNumber - User's mobile number
 * @param {string} [userData.email=""] - Optional User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.userType - User type (patient/doctor)
 * @param {string} [userData.referralCode] - Optional referral code
 * @returns {Promise<Object>} Success response or error
 */
exports.registerNewUser = async ({
  mobileNumber,
  email = null,
  password,
  userType,
  referralCode = null,
}) => {
  try {
    const phoneNumber = refineMobileNumber(mobileNumber);
    const type = userType === "patient" ? USERTYPE.PATIENT : USERTYPE.DOCTOR;
    const vToken = generateVerificationToken();
    const hashedPassword = await hashUsersPassword(password);
    const expiryTime = generateTokenExpiryTime(15);

    const { insertId } = await repo.createNewUser({
      mobileNumber: phoneNumber,
      userType: type,
      email,
      password: hashedPassword,
      vToken,
      referralCode,
      expiryTime,
    });

    if (!insertId) {
      logger.error("Fail to create user");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Fail to create user account. Please try again.",
      });
    }

    sendVerificationTokenSMS({ token: vToken, mobileNumber: phoneNumber });

    return Response.CREATED({
      message: "Account Created Successfully. Please Proceed to Verification",
    });
  } catch (error) {
    logger.error("registerNewUser: ", error);
    throw error;
  }
};

/**
 * Verifies user registration OTP and completes account setup.
 * @param {number} params.token - Verification token
 * @param {Object} params.user - User object (must include userId, userType, accountActive)
 * @returns {Promise<Object>} Success response with tokens or error
 */
exports.verifyRegistrationOTP = async ({ token, user }) => {
  try {
    const {
      userId,
      userType,
      accountActive,
      accountVerified,
      verificationTokenExpiry,
    } = user;

    if (accountVerified === VERIFICATIONSTATUS.VERIFIED) {
      return Response.SUCCESS({ message: "Account is already verified" });
    }

    if (verifyTokenExpiry(verificationTokenExpiry)) {
      logger.warn("verifyRegistrationOTP: Verification code expired");
      return Response.BAD_REQUEST({
        message:
          "Verification Code Expired. Please Request a New Verification Code",
      });
    }

    const { affectedRows } = await repo.updateUserVerificationStatusByToken({
      token,
      verificationStatus: VERIFICATIONSTATUS.VERIFIED,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("verifyRegistrationOTP: No rows updated for token");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Verification Failed. Please Try Again",
      });
    }

    await createStreamUserProfile(userType, userId);

    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });
    const streamToken = await generateStreamUserToken(String(userId));
    await redisClient.delete(`user:token:${token}`);

    return Response.SUCCESS({
      message: "Account Verified Successfully",
      data: {
        token: accessToken,
        streamToken,
        type: userType,
        isVerified: VERIFICATIONSTATUS.VERIFIED,
        isActive: accountActive,
      },
    });
  } catch (error) {
    logger.error("verifyRegistrationOTP: ", error);
    throw error;
  }
};

/**
 * Handles user login with 2FA support
 * @param {Object} user - User object from authentication
 * @returns {Promise<Object>} Login response with tokens or 2FA requirement
 */
exports.loginUser = async ({
  is2faEnabled,
  userId,
  userType,
  accountVerified,
  accountActive,
  mobileNumber,
}) => {
  try {
    if (is2faEnabled === STATUS.ACTIVE) {
      const response = await generateAndSendVerificationOTP({
        userId,
        mobileNumber,
      });
      return response;
    }

    await createStreamUserProfile(userType, userId);

    const { affectedRows } = await repo.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("loginUser: Failed to update user account status");
      return Response.NOT_MODIFIED({});
    }

    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    const streamToken = await generateStreamUserToken(userId.toString());

    // Return access token
    return Response.SUCCESS({
      message: "Logged In Successfully",
      data: {
        token: accessToken,
        streamToken,
        type: userType,
        isVerified: accountVerified,
        isActive: accountActive,
      },
    });
  } catch (error) {
    logger.error("loginUser: ", error);
    throw error;
  }
};

/**
 * Logout a user and blacklist their access token
 * @param {Object} params - Parameters object
 * @param {string|number} params.userId - User ID from user object
 * @param {string} params.token - JWT access token to blacklist
 * @param {string} params.tokenExpiry - JWT access token expiry time
 * @returns {Promise<Object>} Success response or error
 */
exports.logoutUser = async ({ userId, token, tokenExpiry }) => {
  try {
    const { affectedRows } = await repo.updateUserOnlineStatus({
      userId,
      status: STATUS.NOT_ACTIVE,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("[LOGOUT_SERVICE] Failed to update user online status");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Logout failed. Please try again.",
      });
    }

    await Promise.all([
      blacklistToken(token, tokenExpiry),
      redisClient.delete(`user:${userId}`),
    ]);

    return Response.SUCCESS({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("logoutUser:", error);
    throw error;
  }
};

/**
 * Logout a user on all devices and blacklist all their tokens
 * @param {Object} params - Parameters object
 * @param {string|number} params.userId - User ID from user object
 * @param {string} params.token - Current JWT access token to blacklist
 * @param {string} params.tokenExpiry - JWT access token expiry time
 * @returns {Promise<Object>} Success response or error
 */
exports.logoutAllDevices = async ({ userId, token, tokenExpiry }) => {
  try {
    const { affectedRows } = await repo.updateUserOnlineStatus({
      userId,
      status: STATUS.NOT_ACTIVE,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "[LOGOUT_ALL_DEVICES_SERVICE] Failed to update user online status",
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Logout failed. Please try again.",
      });
    }

    await Promise.all([
      blacklistToken(token, tokenExpiry),
      blacklistAllUserTokens(userId),
    ]);

    return Response.SUCCESS({
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    logger.error("logoutAllDevices:", error);
    throw error;
  }
};

/**
 * Requests OTP for user login
 * @param {Object} user - User object
 * @returns {Promise<Object>} Success response or error
 */
exports.requestUserLoginOtp = async ({ userId, mobileNumber }) => {
  try {
    const token = generateVerificationToken();
    const tokenExpiry = generateTokenExpiryTime(15);
    const [updateResult, smsResult] = await Promise.allSettled([
      repo.updateUserVerificationTokenById({ userId, token, tokenExpiry }),
      sendAuthTokenSMS({ token, mobileNumber }),
    ]);

    if (updateResult.status === "rejected" || smsResult.status === "rejected") {
      logger.error(
        "requestUserLoginOtp: Failed to update user token or send SMS",
      );
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to send login OTP. Please Try Again.",
      });
    }

    return Response.SUCCESS({ message: "Login OTP Sent successfully" });
  } catch (error) {
    logger.error("requestUserLoginOtp: ", error);
    throw error;
  }
};

/**
 * Verifies user login OTP
 * @param {Object} user - User object with verification token
 * @returns {Promise<Object>} Success response with access token or 2FA requirement
 */
exports.verifyUserLoginOtp = async ({
  is2faEnabled,
  userId,
  userType,
  mobileNumber,
  accountActive,
  accountVerified,
  verificationTokenExpiry,
}) => {
  try {
    if (is2faEnabled === STATUS.ACTIVE) {
      const response = await generateAndSendVerificationOTP({
        userId,
        mobileNumber,
      });
      return response;
    }

    if (verifyTokenExpiry(verificationTokenExpiry)) {
      logger.warn("verifyUserLoginOtp: Verification code expired");
      return Response.BAD_REQUEST({
        message: "Login OTP expired. Please request a new login OTP",
      });
    }

    await createStreamUserProfile(userType, userId);

    const [tokenResult, statusResult] = await Promise.allSettled([
      repo.updateUserVerificationTokenById({
        userId,
        token: null,
      }),
      repo.updateUserAccountStatusById({
        userId,
        status: STATUS.ACTIVE,
      }),
    ]);

    if (
      tokenResult.status === "rejected" ||
      statusResult.status === "rejected"
    ) {
      logger.error(
        "verifyUserLoginOtp: Failed to update user token or account status",
      );
      return Response.NOT_MODIFIED({});
    }

    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });
    const streamToken = await generateStreamUserToken(userId.toString());

    return Response.SUCCESS({
      message: "Logged In Successfully",
      data: {
        token: accessToken,
        streamToken,
        type: userType,
        isVerified: accountVerified,
        isActive: accountActive,
      },
    });
  } catch (error) {
    logger.error("verifyUserLoginOtp: ", error);
    throw error;
  }
};

/**
 * Resends verification OTP to user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Success response or error
 */
exports.resendVerificationOTP = async (user) => {
  try {
    if (!user) {
      logger.error("resendVerificationOTP: User object is required");
      return Response.BAD_REQUEST({ message: "Error Resending OTP" });
    }
    const {
      user_id: userId,
      verification_token: token,
      is_verified: isVerified,
      mobile_number: mobileNumber,
    } = user;
    if (token && isVerified !== STATUS.ACTIVE) {
      // Send TOKEN VIA SMS
      const response = await generateAndSendVerificationOTP({
        userId,
        mobileNumber,
      });
      return response;
    }
    return Response.NOT_MODIFIED({});
  } catch (error) {
    logger.error("resendVerificationOTP: ", error);
    throw error;
  }
};

/**
 * Sends Forget Password OTP to verified user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Success response or error
 */
exports.sendForgetPasswordOTP = async ({
  userId,
  mobileNumber,
  accountActive,
  accountVerified,
}) => {
  try {
    if (!accountVerified) {
      logger.error("sendForgetPasswordOTP: Unverified user account");
      return Response.BAD_REQUEST({
        message: "Error Sending OTP. Unverified User Account",
      });
    }
    if (!accountActive) {
      logger.error("sendForgetPasswordOTP: Inactive user account");
      return Response.BAD_REQUEST({
        message: "Error Sending OTP. User Account Inactive",
      });
    }
    const response = await generateAndSendVerificationOTP({
      userId,
      mobileNumber,
    });

    return response;
  } catch (error) {
    logger.error("sendForgetPasswordOTP: ", error);
    throw error;
  }
};

/**
 * Verifies requested OTP
 * @param {Object} user - User object with verification token
 * @returns {Promise<Object>} Success response or error
 */
exports.verifyRequestedOTP = async ({
  verificationToken,
  accountVerified,
  verificationTokenExpiry,
}) => {
  try {
    if (!verificationToken || accountVerified !== STATUS.ACTIVE) {
      logger.error("verifyRequestedOTP: Missing token or unverified account");
      return Response.BAD_REQUEST({
        message: "Error verifying forget password OTP, please try again.",
      });
    }

    if (verifyTokenExpiry(verificationTokenExpiry)) {
      logger.warn("verifyRequestedOTP: Forget password OTP expired");
      return Response.BAD_REQUEST({
        message:
          "Forget password OTP expired. Please request a new forget password OTP",
      });
    }
    return Response.SUCCESS({
      message: "Forget password OTP verified successfully.",
    });
  } catch (error) {
    logger.error("verifyRequestedOTP: ", error);
    throw error;
  }
};

/**
 * Updates user's account status by ID
 * @param {Object} params
 * @param {number} params.userId - User ID
 * @param {number} params.status
 * @returns {Promise<Object>} Success response or error
 */
exports.updateUserAccountStatus = async ({ userId, status }) => {
  try {
    const { affectedRows } = await repo.updateUserAccountStatusById({
      userId,
      status: status === STATUS.ACTIVE ? STATUS.NOT_ACTIVE : STATUS.ACTIVE,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("updateUserAccountStatus: Failed to update account status");
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to update account status. Please try again.",
      });
    }

    return Response.SUCCESS({
      message: "Account status updated successfully.",
    });
  } catch (error) {
    logger.error("updateUserAccountStatusById: ", error);
    throw error;
  }
};

/**
 * Updates user password
 * @param {Object} params - Parameters object
 * @param {string} params.newPassword - New password
 * @param {Object} params.user - User object
 * @returns {Promise<Object>} Success response or error
 */
exports.updateUserPassword = async ({ newPassword, userId, mobileNumber }) => {
  try {
    const hashedPassword = await hashUsersPassword(newPassword);
    const { affectedRows } = await repo.updateUserPasswordById({
      userId,
      password: hashedPassword,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error("updateUserPassword: Failed to update password or send SMS");
      return Response.NOT_MODIFIED({
        message: "Failed to update password. Please try again.",
      });
    }

    await repo.updateUserVerificationTokenById({ userId, token: null });
    await sendPasswordResetSMS(mobileNumber);

    // TODO: check if user want to logout of all other devices

    return Response.SUCCESS({
      message:
        "Password updated successfully. Please login with your new password.",
    });
  } catch (error) {
    logger.error("updateUserPassword: ", error);
    throw error;
  }
};

/**
 * Updates user's push notification token
 * @param {Object} params - Parameters object
 * @param {string} params.token - Push notification token
 * @param {String} params.user.id- User Id
 * @returns {Promise<Object>} Success response or error
 */
exports.updatePushNotificationToken = async ({ token, id }) => {
  try {
    const { affectedRows } = await repo.updateUserNotificationToken({
      userId: id,
      notifToken: token,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.error(
        "UPDATE_PUSH_NOTIFICATION_TOKEN_SERVICE: Failed to update token",
      );
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Token Updated Successfully" });
  } catch (error) {
    logger.error("updatePushNotificationToken: ", error);
    throw error;
  }
};
