const jwt = require("jsonwebtoken");
const Response = require("../utils/response.utils");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtAudience,
  jwtAdminAudience,
  jwtIssuer,
} = require("../config/default.config");
const { STATUS, VERIFICATIONSTATUS, USERTYPE } = require("../utils/enum.utils");
const {
  getUserById,
  updateUserOnlineStatus,
} = require("../repository/users.repository");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const {
  areUserTokensInvalidated,
  isTokenBlacklisted,
} = require("../utils/auth.utils");
const logger = require("./logger.middleware");

/**
 * Middleware for extracting the JWT token from the Authorization header.
 * @param {import('express').Request} req - Express request object.
 * @returns {string|null} The JWT token if present, otherwise null.
 */
const getAuthToken = (req) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    logger.info("Authorization header is missing or invalid");
    return null;
  }

  const token = authorizationHeader.split(" ")[1];
  return token || null;
};

/**
 * Middleware to authenticate a user using JWT.
 * Verifies token, checks blacklist, user status, and attaches user info to request.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const authenticateUser = async (req, res, next) => {
  try {
    const token = getAuthToken(req);

    if (!token) {
      logger.warn("[AUTH] No token provided in request");
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "Invalid/Missing Authentication Token",
        }),
      );
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      logger.warn("[AUTH] Token is blacklisted");
      return res.status(401).json({
        message: "Your session has expired. Please log in again to continue.",
      });
    }

    const decoded = jwt.verify(token, patientJwtSecret, {
      audience: jwtAudience,
      issuer: jwtIssuer,
    });

    // Check if user tokens are invalidated (for logout all devices)
    const areInvalidated = await areUserTokensInvalidated(
      decoded.sub,
      decoded.iat,
    );
    if (areInvalidated) {
      logger.warn(`[AUTH] User tokens invalidated for user: ${decoded.sub}`);
      return res
        .status(401)
        .json({ message: "Session expired. Please login again" });
    }

    const user = await getUserById(decoded.sub);

    if (!user) {
      logger.error(`[AUTH] User not found in database for ID: ${decoded.sub}`);
      return res
        .status(401)
        .json(Response.UNAUTHORIZED({ message: "User not found" }));
    }

    const {
      user_id: userId,
      is_verified: isVerified,
      is_account_active: isAccountActive,
      // user_type: userType,
    } = user;

    if (isVerified !== VERIFICATIONSTATUS.VERIFIED) {
      logger.warn(
        `[AUTH] User account not verified for user: ${userId}, status: ${isVerified}`,
      );
      return res.status(401).json(
        Response.UNAUTHORIZED({
          errorCode: "USER_ACCOUNT_UNVERIFIED",
          message: "User Account Not Verified. Please Verify Account",
        }),
      );
    }

    if (isAccountActive !== STATUS.ACTIVE) {
      logger.warn(
        `[AUTH] User account inactive for user: ${userId}, status: ${isAccountActive}`,
      );
      return res.status(401).json(
        Response.UNAUTHORIZED({
          errorCode: "USER_ACCOUNT_INACTIVE",
          message:
            "User Account is InActive. Please Contact KENECARE SUPPORT for further instruction.",
        }),
      );
    }

    updateUserOnlineStatus({
      userId,
      status: STATUS.ACTIVE,
    });

    req.user = {
      id: decoded.sub,
      // isOnline: STATUS.ACTIVE,
    };

    req.token = token;
    req.tokenExpiry = decoded.exp;

    return next();
  } catch (error) {
    logger.error("User Authentication Error", {
      error: error.message,
      stack: error.stack,
      tokenProvided: !!getAuthToken(req),
      path: req.path,
      method: req.method,
    });

    if (error.message === "jwt expired") {
      logger.warn("[AUTH] JWT token expired");
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired Please Login to Continue",
        }),
      );
    }

    if (error.name === "JsonWebTokenError") {
      logger.warn("[AUTH] Invalid JWT token provided");
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Invalid authentication token",
        }),
      );
    }

    if (error.name === "TokenExpiredError") {
      logger.warn("[AUTH] JWT token expired (TokenExpiredError)");
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired Please Login to Continue",
        }),
      );
    }

    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Authentication Failed! Please Try Again",
      }),
    );
  }
};

/**
 * Middleware to authorize a user as a doctor.
 * Checks user type, account status, verification, and doctor profile approval.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const authorizeDoctor = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const user = await getUserById(userId);
    if (!user) {
      logger.error(`[DOCTOR_AUTH] User not found for ID: ${userId}`);
      return res.status(404).json(
        Response.NOT_FOUND({
          message: "User not found",
        }),
      );
    }

    const {
      user_type: userType,
      is_account_active: isAccountActive,
      is_verified: isVerified,
    } = user;

    if (
      userType !== USERTYPE.DOCTOR ||
      isAccountActive !== STATUS.ACTIVE ||
      isVerified !== VERIFICATIONSTATUS.VERIFIED
    ) {
      let reason;
      if (userType !== USERTYPE.DOCTOR) {
        reason = "not_doctor";
      } else if (isAccountActive !== STATUS.ACTIVE) {
        reason = "inactive_account";
      } else {
        reason = "unverified_account";
      }

      logger.warn("[DOCTOR_AUTH] Authorization failed - user validation:", {
        userId,
        userType,
        isAccountActive,
        isVerified,
        reason,
      });
      return res.status(403).json(
        Response.FORBIDDEN({
          message: "Unauthorized Action, please try again",
        }),
      );
    }

    const doctor = await getDoctorByUserId(userId);

    if (!doctor) {
      logger.warn(`[DOCTOR_AUTH] Doctor profile not found for user: ${userId}`);
      return res.status(404).json(
        Response.NOT_FOUND({
          message:
            "Doctor Profile Not Found. Please create profile before proceeding",
          errorCode: "DOCTOR_PROFILE_NOT_FOUND",
        }),
      );
    }

    const { is_profile_approved: isProfileApproved } = doctor;

    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      logger.warn(
        `[DOCTOR_AUTH] Doctor profile not approved for user: ${userId}, status: ${isProfileApproved}`,
      );
      return res.status(403).json(
        Response.FORBIDDEN({
          message:
            "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
        }),
      );
    }
    // Add a flag to track that authorization was successful
    req.authorizationComplete = true;
    return next();
  } catch (error) {
    logger.error("Doctor Authorization Error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path,
      method: req.method,
    });

    if (error.message === "jwt expired") {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired Please Login to Continue",
        }),
      );
    }
    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Authentication Failed! Please Try Again",
      }),
    );
  }
};

/**
 * Middleware to authorize a user as a patient.
 * Checks user type, account status, and verification.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const authorizePatient = async (req, res, next) => {
  try {
    logger.info(
      `[PATIENT_AUTH] Starting patient authorization for user: ${req.user?.id}`,
    );

    const { id: userId } = req.user;
    logger.debug(
      `[PATIENT_AUTH] Fetching user data for patient authorization: ${userId}`,
    );

    const user = await getUserById(userId);
    if (!user) {
      logger.error(`[PATIENT_AUTH] User not found for ID: ${userId}`);
      return res.status(404).json(
        Response.NOT_FOUND({
          message: "User not found",
        }),
      );
    }

    const {
      user_type: userType,
      is_account_active: isAccountActive,
      is_verified: isVerified,
    } = user;

    if (
      userType !== USERTYPE.PATIENT ||
      isAccountActive !== STATUS.ACTIVE ||
      isVerified !== VERIFICATIONSTATUS.VERIFIED
    ) {
      let reason;
      if (userType !== USERTYPE.PATIENT) {
        reason = "not_patient";
      } else if (isAccountActive !== STATUS.ACTIVE) {
        reason = "inactive_account";
      } else {
        reason = "unverified_account";
      }

      logger.warn("[PATIENT_AUTH] Authorization failed - user validation:", {
        userId,
        userType,
        isAccountActive,
        isVerified,
        reason,
      });
      return res.status(403).json(
        Response.FORBIDDEN({
          message: "Unauthorized Action, please try again",
        }),
      );
    }

    logger.info(
      `[PATIENT_AUTH] Patient authorization successful for user: ${userId}`,
    );
    return next();
  } catch (error) {
    logger.error("Patient Authorization Error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path,
      method: req.method,
    });

    if (error.message === "jwt expired") {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired Please Login to Continue",
        }),
      );
    }
    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Authentication Failed! Please Try Again",
      }),
    );
  }
};

/**
 * Middleware to authenticate an admin user using JWT.
 * Verifies token and checks admin account status.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = getAuthToken(req);

    if (!token) {
      logger.warn("[ADMIN_AUTH] No token provided in request");
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "Invalid/Missing Authentication Token",
        }),
      );
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      logger.warn("[AUTH] Token is blacklisted");
      return res.status(401).json({
        message:
          "Your session has expired or you have logged out. Please log in again to continue.",
      });
    }

    const decoded = jwt.verify(token, adminJwtSecret, {
      audience: jwtAdminAudience,
      issuer: jwtIssuer,
    });

    // Check if user tokens are invalidated (for logout all devices)
    const areInvalidated = await areUserTokensInvalidated(
      decoded.sub,
      decoded.iat,
    );
    if (areInvalidated) {
      logger.warn(`[AUTH] User tokens invalidated for user: ${decoded.sub}`);
      return res
        .status(401)
        .json({ message: "Session expired. Please login again" });
    }

    const { sub, actSts } = decoded;

    if (actSts !== STATUS.ACTIVE) {
      logger.warn(
        `[ADMIN_AUTH] Admin account disabled for user: ${sub}, status: ${actSts}`,
      );
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Account Disabled. Please Contact Support",
        }),
      );
    }

    req.user = {
      id: sub,
    };

    req.token = token;
    req.tokenExpiry = decoded.exp;

    return next();
  } catch (error) {
    logger.error("Admin Authentication Error", {
      error: error.message,
      stack: error.stack,
      tokenProvided: !!getAuthToken(req),
      path: req.path,
      method: req.method,
    });

    if (error.message === "jwt expired") {
      logger.warn("[ADMIN_AUTH] Admin JWT token expired");
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired. Please Login Again",
        }),
      );
    }

    if (error.name === "JsonWebTokenError") {
      logger.warn("[ADMIN_AUTH] Invalid admin JWT token provided");
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "Invalid authentication token",
        }),
      );
    }

    if (error.name === "TokenExpiredError") {
      logger.warn("[ADMIN_AUTH] Admin JWT token expired (TokenExpiredError)");
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired. Please Login Again",
        }),
      );
    }

    return res.status(400).json(
      Response.BAD_REQUEST({
        message: "Authentication Failed! Please Try Again",
      }),
    );
  }
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
  authorizeDoctor,
  authorizePatient,
  getAuthToken,
};
