const jwt = require("jsonwebtoken");
const Response = require("../utils/response.utils");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtAudience,
  jwtAdminAudience,
  jwtIssuer,
} = require("../config/default.config");
const { STATUS } = require("../utils/enum.utils");

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

    req.user = {
      id: decoded.sub,
    };
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json(
      Response.BAD_REQUEST({
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
    console.error(error);
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
