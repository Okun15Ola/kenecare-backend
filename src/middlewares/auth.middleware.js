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
  updateUserAccountStatusById,
} = require("../repository/users.repository");
const { getDoctorByUserId } = require("../repository/doctors.repository");
const logger = require("./logger.middleware");

const getAuthToken = (req) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.split(" ")[1];
  return token || null;
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "Invalid/Missing Authentication Token",
        }),
      );
    }
    const decoded = jwt.verify(token, patientJwtSecret, {
      audience: jwtAudience,
      issuer: jwtIssuer,
    });

    const user = await getUserById(decoded.sub);
    if (!user) {
      return Response.BAD_REQUEST({ message: "An Unexpected Error Occured" });
    }

    const {
      user_id: userId,
      is_verified: isVerified,
      is_account_active: isAccountActive,
      // user_type: userType,
    } = user;

    if (isVerified !== VERIFICATIONSTATUS.VERIFIED) {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          errorCode: "USER_ACCOUNT_UNVERIFIED",
          message: "User Account Not Verified. Please Verify Account",
        }),
      );
    }
    if (isAccountActive !== STATUS.ACTIVE) {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          errorCode: "USER_ACCOUNT_INACTIVE",
          message:
            "User Account is InActive. Please Contact KENECARE SUPPORT for further instruction.",
        }),
      );
    }

    updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    req.user = {
      id: decoded.sub,
    };

    return next();
  } catch (error) {
    logger.error("User Authentication Error", error);
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

const authorizeDoctor = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const user = await getUserById(userId);
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
      return res.status(403).json(
        Response.FORBIDDEN({
          message: "Unauthorized Action, please try again",
        }),
      );
    }
    const doctor = await getDoctorByUserId(userId);
    if (!doctor) {
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
      return res.status(403).json(
        Response.FORBIDDEN({
          message:
            "Doctor's Profile has not been approved by admin. Please contact admin for profile approval and try again",
        }),
      );
    }
    return next();
  } catch (error) {
    console.log(error);
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

const authorizePatient = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const user = await getUserById(userId);
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
      return res.status(403).json(
        Response.FORBIDDEN({
          message: "Unauthorized Action, please try again",
        }),
      );
    }
    return next();
  } catch (error) {
    console.log(error);
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

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = getAuthToken(req);

    if (!token) {
      return res.status(400).json(
        Response.BAD_REQUEST({
          message: "Invalid/Missing Authentication Token",
        }),
      );
    }

    const decoded = jwt.verify(token, adminJwtSecret, {
      audience: jwtAdminAudience,
      issuer: jwtIssuer,
    });

    const { sub, actSts } = decoded;

    if (actSts !== STATUS.ACTIVE) {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Account Disabled.Please Contact Support",
        }),
      );
    }

    req.user = {
      id: sub,
    };
    return next();
  } catch (error) {
    if (error.message === "jwt expired") {
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
};
