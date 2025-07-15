const logger = require("./logger.middleware");

const logUserInteraction = async (req, res, next) => {
  try {
    const { ip, method, originalUrl, headers } = req;

    const userAgent = headers["user-agent"];
    const platform = headers["sec-ch-ua-platform"];

    const logData = {
      action: `${method} ${originalUrl}`,
      ip_address: ip,
      device_type: userAgent,
      os_platform: platform || null,
    };

    logger.info("AUDIT LOG: ", logData);
    next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

module.exports = logUserInteraction;
