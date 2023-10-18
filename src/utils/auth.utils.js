const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  patientJwtSecret,
  adminJwtSecret,
  jwtIssuer,
  jwtAudience,
} = require("../config/default.config");

const hashUsersPassword = async (password) => {
  try {
    return await bcryptjs.hash(password, 10);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const comparePassword = async ({ plainPassword, hashedPassword }) => {
  try {
    return await bcryptjs.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateUsersJwtAccessToken = (user) => {
  try {
    return jwt.sign(user, patientJwtSecret, {
      issuer: jwtIssuer,
      audience: jwtAudience,
      expiresIn: "1d",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const generateAdminJwtAccessToken = (admin) => {
  try {
    return jwt.sign(admin, adminJwtSecret, {
      issuer: jwtIssuer,
      audience: "admin.kenecare.com",
      expiresIn: "1d",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const generateVerificationToken = () => {
  try {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  hashUsersPassword,
  comparePassword,
  generateVerificationToken,
  generateUsersJwtAccessToken,
  generateAdminJwtAccessToken,
};
