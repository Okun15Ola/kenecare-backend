const dbObject = require("../db/db.users");
const {
  generateVerificationToken,
  generateUsersJwtAccessToken,
} = require("../utils/auth.utils");
const { USERTYPE, VERIFICATIONSTATUS, STATUS } = require("../utils/enum.utils");
const { hashUsersPassword } = require("../utils/auth.utils");
const {
  sendAuthTokenSMS,
  sendPasswordResetSMS,
  sendForgotPasswordRequestTokenSMS,
  sendMarketerUserRegisteredSMS,
} = require("../utils/sms.utils");
// const { sendPushNotifications } = require("../utils/notification.utils");
const Response = require("../utils/response.utils");
const { getMarketerByReferralCode } = require("../db/db.marketers");

exports.getUsers = async () => {
  const rawData = await dbObject.getAllUsers();
  return rawData;
};

exports.getUserById = async (id) => {
  try {
    const rawData = await dbObject.getUserById(id);
    if (!rawData) {
      return null;
    }
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
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByMobileNumber = async (number) => {
  try {
    const rawData = await dbObject.getUserByMobileNumber(number);
    if (!rawData) {
      return null;
    }
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
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.getUserByEmail = async (userEmail) => {
  try {
    const rawData = await dbObject.getUserByEmail(userEmail);
    if (!rawData) {
      return null;
    }
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

    // reate user and send OTP via SMS
    await Promise.allSettled([
      dbObject.createNewUser({
        mobileNumber,
        email,
        password: hashedPassword,
        userType: type,
        vToken,
        referralCode,
      }),
      sendAuthTokenSMS({ token: vToken, mobileNumber }),
    ]);

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
    if (!rawData) {
      return null;
    }
    const {
      user_id: userId,
      mobile_number: mobileNumber,
      email,
      user_type: userType,
      is_verified: accountVerified,
      is_account_active: accountActive,
      is_online: isOnline,
      is_2fa_enabled: is2faEnabled,
      referral_code: referralCode,
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
      referralCode,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.verifyRegistrationOTP = async (token) => {
  try {
    const user = await dbObject.getUserByVerificationToken(token);

    const {
      user_id: userId,
      user_type: userType,
      account_active: accountActive,
      referral_code: referralCode,
      mobile_number: userMobileNumber,
    } = user;

    const marketer = await getMarketerByReferralCode(referralCode);
    const { phone_number: phoneNumber, first_name: marketerFirstName } =
      marketer;

    await Promise.all([
      dbObject.updateUserVerificationStatusByToken({
        token,
        verificationStatus: VERIFICATIONSTATUS.VERIFIED,
      }),
      sendMarketerUserRegisteredSMS({
        marketerName: marketerFirstName,
        mobileNumber: phoneNumber,
        userPhoneNumber: userMobileNumber,
      }),
    ]);

    // Generate access token
    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
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
      // generate token for 2-factor authentication
      const token = generateVerificationToken();

      await dbObject.updateUserVerificationTokenById({
        userId,
        token,
      });

      // send sms notifcation with 2fa token
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({ message: "2FA Token Sent successfully" });
    }

    // Generate access token
    const accessToken = generateUsersJwtAccessToken({
      sub: userId,
    });

    // update user's active status in the database
    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });
    // Return access token
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
    const { userId, accountVerified, accountActive, mobileNumber } = user;

    //  Check if the account is verified
    if (accountVerified !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has not been verified. Please Verify account and try again",
      });
    }

    //  check if the account has not been deactivated by admin
    if (accountActive !== STATUS.ACTIVE) {
      return Response.UNAUTHORIZED({
        message:
          "Account has been been disabled by system administrator. Please Contact for further instructions",
      });
    }
    // Generate Login OTP
    const token = generateVerificationToken();

    // Update user's OTP in database
    await dbObject.updateUserVerificationTokenById({
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
    await dbObject.updateUserVerificationTokenById({
      userId,
      token: null,
    });

    dbObject.updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    if (is2faEnabled === STATUS.ACTIVE) {
      // generate token for 2-factor authentication
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

exports.resendVerificationOTP = async (user) => {
  try {
    if (!user) {
      return Response.BAD_REQUEST({ message: "Error Resending OTP" });
    }
    const {
      verification_token: token,
      is_verified: isVerified,
      mobile_number: mobileNumber,
    } = user;

    if (token && isVerified !== STATUS.ACTIVE) {
      console.log("in");
      // Send TOKEN VIA SMS
      await sendAuthTokenSMS({ token, mobileNumber });
      return Response.SUCCESS({
        message: "Verification OTP resent succesfully",
      });
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
    const token = generateVerificationToken();

    await dbObject.updateUserVerificationTokenById({
      userId,
      token,
    });
    // Send TOKEN VIA SMS
    await sendForgotPasswordRequestTokenSMS({ token, mobileNumber });
    // return success response to user
    return Response.SUCCESS({
      message: "Verification OTP sent succesfully",
    });
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
      dbObject.updateUserPasswordById({
        userId,
        password: hashedPassword,
      }),
      dbObject.updateUserVerificationTokenById({ userId, token: null }),
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
    await dbObject.updateUserNotificationToken({ userId, notifToken: token });

    return Response.SUCCESS({ message: "Token Updated Successfully" });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
