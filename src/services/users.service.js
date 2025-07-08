const repo = require("../repository/users.repository");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
  generateAndSendVerificationOTP,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const { hashUsersPassword } = require("../utils/auth.utils");
const {
  sendAuthTokenSMS,
  sendVerificationTokenSMS,
  sendPasswordResetSMS,
} = require("../utils/sms.utils");
const Response = require("../utils/response.utils");
const {
  createOrUpdateStreamUser,
  generateStreamUserToken,
} = require("../utils/stream.utils");
const { getPatientByUserId } = require("../repository/patients.repository");
const { getFileUrlFromS3Bucket } = require("../utils/aws-s3.utils");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const redisClient = require("../config/redis.config");
const { cacheKeyBulider } = require("../utils/caching.utils");
const { mapUserRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");

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
      return Response.NOT_FOUND({ message: "Users not found" });
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
    console.error(error);
    throw error;
  }
};

exports.getUserById = async (id) => {
  try {
    const cacheKey = `users:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserById(id);
    if (!rawData) {
      return null;
    }

    const user = mapUserRow(rawData, true);

    if (!user) {
      return Response.NOT_FOUND({ message: "User not found" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByMobileNumber = async (number) => {
  try {
    const cacheKey = `users:${number}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByMobileNumber(number);
    if (!rawData) {
      return null;
    }
    const user = mapUserRow(rawData, true);

    if (!user) {
      return Response.NOT_FOUND({ message: "User not found" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByEmail = async (userEmail) => {
  try {
    const cacheKey = `users:${userEmail}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByEmail(userEmail);
    if (!rawData) {
      return null;
    }
    const user = mapUserRow(rawData, true);

    if (!user) {
      return Response.NOT_FOUND({ message: "User not found" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByToken = async (token) => {
  try {
    const cacheKey = `users:${token}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const rawData = await repo.getUserByVerificationToken(token);
    if (!rawData) {
      return null;
    }
    const user = mapUserRow(rawData, false, true);

    if (!user) {
      return Response.NOT_FOUND({ message: "User not found" });
    }

    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(user),
    });
    return user;
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
  referralCode,
}) => {
  try {
    // DONE Check user type and match with expected values
    const type = userType === "patient" ? USERTYPE.PATIENT : USERTYPE.DOCTOR;

    // GENERATE VERIFICATION TOKEN
    const vToken = generateVerificationToken();

    // has plain text password
    const hashedPassword = await hashUsersPassword(password);

    // create user and send OTP via SMS
    const [userResult, smsResult] = await Promise.all([
      repo.createNewUser({
        mobileNumber,
        userType: type,
        email,
        password: hashedPassword,
        vToken,
        referralCode,
      }),
      sendVerificationTokenSMS({ token: vToken, mobileNumber }),
    ]);

    if (!userResult || !smsResult) {
      logger.error("Failed to create user:", userResult, smsResult);
      return Response.INTERNAL_SERVER_ERROR({
        message: "Failed to create user account.",
      });
    }

    return Response.CREATED({
      message: "Account Created Successfully. Please Proceed to verification",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.verifyRegistrationOTP = async (token) => {
  try {
    const user = await repo.getUserByVerificationToken(token);

    const {
      user_id: userId,
      user_type: userType,
      account_active: accountActive,
    } = user;

    repo.updateUserVerificationStatusByToken({
      token,
      verificationStatus: VERIFICATIONSTATUS.VERIFIED,
    });

    if ([USERTYPE.PATIENT, USERTYPE.DOCTOR].includes(userType)) {
      const fetchUserDetails =
        userType === USERTYPE.PATIENT ? getPatientByUserId : getDoctorByUserId;
      const userDetails = await fetchUserDetails(userId);

      if (userDetails) {
        const {
          first_name: firstName,
          last_name: lastName,
          profile_pic_url: profilePicUrl,
          mobile_number: mobileNumber,
        } = userDetails;
        const imageUrl = await getFileUrlFromS3Bucket(profilePicUrl);

        await createOrUpdateStreamUser({
          userId: userId.toString(),
          mobileNumber,
          userType,
          username: `${firstName} ${lastName}`,
          image: imageUrl,
        });
      }
    }

    // Generate access token
    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    const streamToken = await generateStreamUserToken(userId.toString());

    //
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
    console.error(error);
    throw error;
  }
};

exports.loginUser = async (user) => {
  try {
    const {
      is2faEnabled,
      userId,
      userType,
      accountVerified,
      accountActive,
      mobileNumber,
    } = user;

    //  Check if the account is verified
    if (accountVerified !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has not been verified. Please Verify account and try again",
        errorCode: "ACCOUNT_UNVERIFIED",
      });
    }

    //  check if the account has not been deactivated by admin
    if (accountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has been been disabled by system administrator. Please Contact for further instructions",
        errorCode: "ACCOUNT_INACTIVE",
      });
    }

    // Check if 2FA is enabled on the user's account
    if (is2faEnabled === STATUS.ACTIVE) {
      const token = generateVerificationToken();

      await Promise.allSettled([
        repo.updateUserVerificationTokenById({
          userId,
          token,
        }),
        sendAuthTokenSMS({ token, mobileNumber }),
      ]);

      return Response.SUCCESS({ message: "2FA Token Sent successfully" });
    }

    if ([USERTYPE.PATIENT, USERTYPE.DOCTOR].includes(userType)) {
      const fetchUserDetails =
        userType === USERTYPE.PATIENT ? getPatientByUserId : getDoctorByUserId;
      const userDetails = await fetchUserDetails(userId);

      if (userDetails) {
        const {
          first_name: firstName,
          last_name: lastName,
          profile_pic_url: profilePicUrl,
        } = userDetails;

        const imageUrl = await getFileUrlFromS3Bucket(profilePicUrl);

        await createOrUpdateStreamUser({
          userId: userId.toString(),
          mobileNumber,
          userType,
          username: `${firstName} ${lastName}`,
          image: imageUrl,
        });
      }
    }

    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    const streamToken = await generateStreamUserToken(userId.toString());

    // update user's active status in the database
    await repo.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });
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
    console.error(error);
    throw error;
  }
};
exports.requestUserLoginOtp = async (user) => {
  try {
    const { userId, accountVerified, accountActive, mobileNumber } = user;

    //  Check if the account is verified
    //  Check if the account is verified
    if (accountVerified !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has not been verified. Please Verify account and try again",
        errorCode: "ACCOUNT_UNVERIFIED",
      });
    }

    //  check if the account has not been deactivated by admin
    if (accountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has been been disabled by system administrator. Please Contact for further instructions",
        errorCode: "ACCOUNT_INACTIVE",
      });
    }
    // Generate Login OTP
    const token = generateVerificationToken();

    // Update user's OTP in database
    await repo.updateUserVerificationTokenById({
      userId,
      token,
    });

    // send sms with generated token
    await sendAuthTokenSMS({ token, mobileNumber });

    // return response to user
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
    await Promise.all([
      repo.updateUserVerificationTokenById({
        userId,
        token: null,
      }),
      repo.updateUserAccountStatusById({
        userId,
        status: STATUS.ACTIVE,
      }),
    ]);

    if (is2faEnabled === STATUS.ACTIVE) {
      // generate token for 2-factor authentication

      const response = await generateAndSendVerificationOTP({
        userId,
        mobileNumber,
      });
      return response;
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

    return Response.SUCCESS({ message: "Login Successful", data: accessToken });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.resendVerificationOTP = async (user) => {
  try {
    if (!user) {
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
    return Response.NOT_MODIFIED();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.sendVerificationOTP = async (user) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({
        message: "Error Sending OTP. Please try again",
      });
    }

    const {
      user_id: userId,
      is_verified: isVerified,
      is_account_active: isAccountActive,
      mobile_number: mobileNumber,
    } = user;

    if (!isVerified) {
      return Response.BAD_REQUEST({
        message: "Error Sending OTP. Unverified User Account",
      });
    }
    if (!isAccountActive) {
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
    console.error(error);
    throw error;
  }
};
exports.verifyRequestedOTP = async (user) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({
        message: "Error verifying token, please try again with a valid token.",
      });
    }
    const { verification_token: token, is_verified: isVerified } = user;

    if (!token || isVerified !== STATUS.ACTIVE) {
      return Response.BAD_REQUEST({
        message: "Error verifying token, please try again.",
      });
    }
    return Response.SUCCESS({
      message: "OTP Verified Successfully.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateUserPassword = async ({ newPassword, user }) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({
        message: "Error updating password, please try again.",
      });
    }

    const {
      user_id: userId,
      is_verified: isVerified,
      mobile_number: mobileNumber,
    } = user;

    if (isVerified !== STATUS.ACTIVE) {
      return Response.BAD_REQUEST({
        message:
          "Unverified account, please verify account before performing this action",
      });
    }

    const hashedPassword = await hashUsersPassword(newPassword);

    await Promise.all([
      repo.updateUserPasswordById({
        userId,
        password: hashedPassword,
      }),
      repo.updateUserVerificationTokenById({ userId, token: null }),
      sendPasswordResetSMS(mobileNumber),
    ]);

    return Response.SUCCESS({
      message:
        "Password Reset Successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updatePushNotificationToken = async ({ token, user }) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({
        message: "User Not Found. Error Updating token",
      });
    }

    const { id: userId } = user;
    await repo.updateUserNotificationToken({ userId, notifToken: token });

    return Response.SUCCESS({ message: "Token Updated Successfully" });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
