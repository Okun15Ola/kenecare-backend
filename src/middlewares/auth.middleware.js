const jwt = require("jsonwebtoken");
const Response = require("../utils/response.utils");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtAudience,
  jwtAdminAudience,
  jwtIssuer,
} = require("../config/default.config");
const { STATUS, VERIFICATIONSTATUS } = require("../utils/enum.utils");
const { getUserById } = require("../db/db.users");

const getAuthToken = (req) => {
  const authorizationHeader = req.headers["authorization"];

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
        })
      );
    }
    const decoded = jwt.verify(token, patientJwtSecret, {
      audience: jwtAudience,
      issuer: jwtIssuer,
    });

    const user = await getUserById(decoded.sub);
    if (user) {
      const { is_verified, is_account_active } = user;
      if (is_verified !== VERIFICATIONSTATUS.VERIFIED) {
        return res.status(401).json(
          Response.UNAUTHORIZED({
            message: "Account Not Verified. Please Verify Account",
          })
        );
      }
      if (is_account_active !== STATUS.ACTIVE) {
        return res.status(401).json(
          Response.UNAUTHORIZED({
            message:
              "Account InActive. Please Contact KENECARE SUPPORT for further instruction.",
          })
        );
      }
      req.user = {
        id: decoded.sub,
      };

      next();
    }
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired Please Login to Continue",
        })
      );
    }
    return res.status(401).json(
      Response.UNAUTHORIZED({
        message: "Authentication Failed! Please Try Again",
      })
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
        })
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
        })
      );
    }

    req.user = {
      id: sub,
    };
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      return res.status(401).json(
        Response.UNAUTHORIZED({
          message: "Session Expired. Please Login Again",
        })
      );
    }
    return res.status(400).json(
      Response.BAD_REQUEST({
        message: "Authentication Failed! Please Try Again",
      })
    );
  }
};

module.exports = {
  requireUserAuth,
  requireAdminAuth,
};
