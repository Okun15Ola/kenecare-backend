const jwt = require("jsonwebtoken");
const Response = require("../utils/responses.utils");

const requireAuth = async (req, res, next) => {
  try {
    if (req.headers["authorization"]) {
      const authorization = req.headers["authorization"].split(" ")[0];
      const token = req.headers["authorization"].split(" ")[1];
      if (authorization !== "Bearer") {
        return res
          .status(400)
          .json(Response.badRequest("Authentication Error!", null));
      }

      if (!token) {
        return res
          .status(400)
          .json(Response.badRequest("Authentication Error!", null));
      }

      const decoded = await jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {}
      );

      req.user = {
        id: decoded.sub,
        admin: decoded.admin,
      };
      next();
    } else {
      return res
        .status(400)
        .json(Response.badRequest("Authentication Error!", null));
    }
  } catch (err) {
    if (err.message === "jwt expired") {
      return res
        .status(401)
        .json(Response.unAuthorized("Session Expired. Login Again!", null));
    }
    res.status(400).json(Response.badRequest("Authentication Error!", err));
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    if (req.headers["authorization"]) {
      const authorization = req.headers["authorization"].split(" ")[0];
      const token = req.headers["authorization"].split(" ")[1];
      if (authorization !== "Bearer")
        return res
          .status(400)
          .json(Response.badRequest("Authentication Error!", null));

      if (!token) {
        return res
          .status(400)
          .json(Response.badRequest("Authentication Error!", null));
      }

      const decoded = await jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {}
      );

      const { admin } = decoded;
      if (!admin) {
        return res
          .status(401)
          .json(Response.unAuthorized("UnAuthorized Access", null));
      }
      next();
    } else {
      return res
        .status(401)
        .json(Response.unAuthorized("UnAuthorized Access", null));
    }
  } catch (err) {
    if (err.message === "jwt expired") {
      return res
        .status(401)
        .json(Response.unAuthorized("Session Expired. Login Again!", null));
    }
    res.status(400).json(Response.badRequest("Authentication Error!", err));
  }
};

const requireUser = async (req, res, next) => {
  try {
    if (req.headers["authorization"]) {
      const authorization = req.headers["authorization"].split(" ")[0];
      const token = req.headers["authorization"].split(" ")[1];
      if (authorization !== "Bearer") return res.sendStatus(400);

      if (!token) return res.sendStatus(400);

      const decoded = await jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {}
      );

      //todo check if the issuer is valid
      req.user = decoded;
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(400);
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
};
