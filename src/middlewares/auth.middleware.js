const jwt = require("jsonwebtoken");
const Response = require("../utils/response.utils");
const {patientJwtSecret,adminJwtSecret,jwtAudience,jwtAdminAudience,jwtIssuer} = require("../config/default.config");
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
    const token = getAuthToken(req)
    
    if (!token) {
      return res
          .status(400)
          .json({message:"Bad Request"});
    }
      const decoded =  jwt.verify(
        token,
        patientJwtSecret,
        {audience:jwtAudience,issuer:jwtIssuer}
      );
    
      console.log(decoded);
      // return

      // req.user = {
      //   id: decoded.sub,
      //   admin: decoded.admin,
      // };
      next();

  } catch (error) {
    console.error(error)
    return res.status(400).json(Response.BAD_REQUEST({message:"Authentication Failed! Please Try Again"})); 
  }
};

const requireAdminAuth = async (req, res, next) => {
  try {
    const token = getAuthToken(req)
    
    if (!token) {
      return res
          .status(400)
          .json(Response.BAD_REQUEST({message:"Authentication Error!"}));
    }

    const decoded =  jwt.verify(
        token,
        adminJwtSecret,
        {audience:jwtAdminAudience,issuer:jwtIssuer}
    );
    
      const {sub,actSts} = decoded

      
      if (actSts !== STATUS.ACTIVE) {
        return res
          .status(401)
          .json(Response.UNAUTHORIZED({message:"Account Disabled.Please Contact Support"}));
      }
    
      req.user = {
        id: sub,
      }
      next();
  } catch (error) {
     console.error(error)
    return res.status(400).json(Response.BAD_REQUEST({message:"Authentication Failed! Please Try Again"})); 
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
  requireUserAuth,
   requireAdminAuth,
};
