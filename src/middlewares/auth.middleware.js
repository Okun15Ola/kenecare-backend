const jwt = require("jsonwebtoken");
const Response = require("../utils/response.utils");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtAudience,
  jwtAdminAudience,
  jwtIssuer,
} = require("../config/default.config");
const {
  STATUS,
  VERIFICATIONSTATUS,
  // USERTYPE,
  // ERROR_CODES,
} = require("../utils/enum.utils");
const { getUserById, updateUserAccountStatusById } = require("../db/db.users");
const { getDoctorByUserId } = require("../db/db.doctors");
// const { getPatientByUserId } = require("../db/db.patients");
// const { generateUsersJwtAccessToken } = require("../utils/auth.utils");
const logger = require("./logger.middleware");

const getAuthToken = (req) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.split(" ")[1];
  return token || null;
};

const requireUserAuth = async (req, res, next) => {
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
            "User Account InActive. Please Contact KENECARE SUPPORT for further instruction.",
        }),
      );
    }

    // Generate access token for logged in users
    // const accessJwt = generateUsersJwtAccessToken({
    //   sub: userId,
    // });

    updateUserAccountStatusById({
      userId,
      status: STATUS.ACTIVE,
    });

    // TODO move to seperate middleware function
    // if (userType === USERTYPE.DOCTOR) {
    //   const doctorProfile = await getDoctorByUserId(userId);
    //   if (!doctorProfile) {
    //     return res.status(404).json(
    //       Response.SUCCESS({
    //         message: ERROR_CODES.DOCTOR_PROFILE_NOT_FOUND,
    //         data: {
    //           token: accessJwt,
    //           type: userType,
    //           isVerified,
    //           isActive: isAccountActive,
    //         },
    //       }),
    //     );
    //   }
    // }

    // if (userType === USERTYPE.PATIENT) {
    //   const patientProfile = await getPatientByUserId(userId);
    //   if (!patientProfile) {
    //     return res.status(404).json(
    //       Response.SUCCESS({
    //         message: ERROR_CODES.PATIENT_PROFILE_NOT_FOUND,
    //         data: {
    //           token: accessJwt,
    //           type: userType,
    //           isVerified,
    //           isActive: isAccountActive,
    //         },
    //       }),
    //     );
    //   }
    // }
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

const requireDoctorAuth = async (req, res, next) => {
  try {
    const doctorProfile = await getDoctorByUserId(req.user.id);
    if (!doctorProfile) {
      return res.status(404).json(
        Response.NOT_FOUND({
          message: "Doctor Profile Not FounD",
        }),
      );
    }
    const { is_profile_approved: isProfileApproved } = doctorProfile;
    if (isProfileApproved !== VERIFICATIONSTATUS.VERIFIED) {
      return res.status(401).json(
        Response.UNAUTHORIZED({
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

const requireAdminAuth = async (req, res, next) => {
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
  requireUserAuth,
  requireDoctorAuth,
  requireAdminAuth,
};
