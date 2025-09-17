// const geoip = require("geoip-lite"); // npm install geoip-lite
// const logger = require("./logger.middleware");

// // Helper functions for threat detection
// function containsSqlInjection(req) {
//   const sqlPatterns = [
//     /(%27)|(')|(--)|(%23)|(#)/i,
//     /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/i,
//     /\w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))/i,
//     /(union).+(select)/i,
//     /exec[\s+]+(s|x)p/i,
//   ];

//   const checkString = (str) => {
//     if (!str) return false;
//     return sqlPatterns.some((pattern) => pattern.test(str));
//   };

//   // Check URL path
//   if (checkString(req.path)) return true;

//   // Check query parameters
//   if (req.query) {
//     if (Object.keys(req.query).some((key) => checkString(req.query[key]))) {
//       return true;
//     }
//   }

//   // Check body if it exists and is an object
//   if (req.body && typeof req.body === "object") {
//     const bodyStr = JSON.stringify(req.body);
//     if (checkString(bodyStr)) return true;
//   }

//   return false;
// }

// function containsXss(req) {
//   const xssPatterns = [
//     /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
//     /on\w+\s*=/gi,
//     /javascript:/gi,
//     /eval\(/gi,
//     /expression\(/gi,
//   ];

//   const checkString = (str) => {
//     if (!str) return false;
//     return xssPatterns.some((pattern) => pattern.test(str));
//   };

//   // Similar checks as in SQL injection function
//   if (checkString(req.path)) return true;

//   if (req.query) {
//     if (Object.keys(req.query).some((key) => checkString(req.query[key]))) {
//       return true;
//     }
//   }

//   if (req.body && typeof req.body === "object") {
//     const bodyStr = JSON.stringify(req.body);
//     if (checkString(bodyStr)) return true;
//   }

//   return false;
// }

// function containsPathTraversal(str) {
//   if (!str) return false;
//   return /\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e%252f|%c0%ae%c0%ae%c0%af/i.test(
//     str,
//   );
// }

// function isSuspiciousUserAgent(userAgent) {
//   if (!userAgent) return false;
//   const suspiciousAgents = [
//     /sqlmap/i,
//     /nikto/i,
//     /nessus/i,
//     /burpsuite/i,
//     /w3af/i,
//     /masscan/i,
//     /nmap/i,
//     /acunetix/i,
//     /zap/i,
//   ];

//   return suspiciousAgents.some((pattern) => pattern.test(userAgent));
// }

// function isAbnormalRequest(req) {
//   // Check for abnormal headers
//   const abnormalHeaders = [
//     "x-scan-signature",
//     "x-hacker",
//     "acunetix-product",
//     "x-scanner",
//   ];

//   if (abnormalHeaders.some((header) => req.headers[header])) {
//     return true;
//   }

//   // Unusual content-type for the given path
//   if (
//     req.path.endsWith(".jpg") &&
//     req.headers["content-type"] &&
//     !req.headers["content-type"].includes("image")
//   ) {
//     return true;
//   }

//   // Unusual request methods for typical endpoints
//   return (
//     (req.path.includes("/images/") || req.path.includes(".css")) &&
//     req.method !== "GET"
//   );
// }

// /**
//  * Enhanced security logging middleware with threat detection
//  */
// const securityLogger = (req, res, next) => {
//   // Extract important request data
//   const requestData = {
//     timestamp: new Date().toISOString(),
//     ip: req.ip || req.connection.remoteAddress,
//     method: req.method,
//     path: req.originalUrl || req.url,
//     userAgent: req.headers["user-agent"] || "unknown",
//     referer: req.headers.referer || "unknown",
//     requestId: req.headers["x-request-id"] || `req-${Date.now()}`,
//     apiKey: req.headers["x-api-key"]
//       ? `${req.headers["x-api-key"].substring(0, 8)}...`
//       : "none",
//     contentLength: req.headers["content-length"] || 0,
//     contentType: req.headers["content-type"] || "unknown",
//   };

//   // Add GeoIP data
//   try {
//     const geo = geoip.lookup(requestData.ip);
//     if (geo) {
//       requestData.location = {
//         country: geo.country,
//         region: geo.region,
//         city: geo.city,
//         ll: geo.ll, // latitude/longitude
//       };
//     }
//   } catch (err) {
//     // GeoIP lookup failed, continue without location data
//   }

//   // Detect potential security threats
//   const threats = [];

//   // SQL Injection attempts
//   if (containsSqlInjection(req)) {
//     threats.push("SQL_INJECTION");
//   }

//   // XSS attempts
//   if (containsXss(req)) {
//     threats.push("XSS");
//   }

//   // Directory traversal
//   if (
//     containsPathTraversal(req.path) ||
//     containsPathTraversal(Object.keys(req.query).join("")) ||
//     (req.body && containsPathTraversal(JSON.stringify(req.body)))
//   ) {
//     threats.push("PATH_TRAVERSAL");
//   }

//   // Suspicious user agent
//   if (isSuspiciousUserAgent(req.headers["user-agent"])) {
//     threats.push("SUSPICIOUS_USER_AGENT");
//   }

//   // Abnormal request patterns
//   if (isAbnormalRequest(req)) {
//     threats.push("ABNORMAL_REQUEST");
//   }

//   // High volume of requests from same IP (would need to be tracked in a store)
//   // This is simplified and would need persistent tracking in production
//   if (
//     req.ip &&
//     global._ipRequestCounts &&
//     global._ipRequestCounts[req.ip] > 100
//   ) {
//     threats.push("HIGH_REQUEST_VOLUME");
//   }

//   // Initialize or increment IP request counter
//   if (!global._ipRequestCounts) global._ipRequestCounts = {};
//   if (!global._ipRequestCounts[req.ip]) global._ipRequestCounts[req.ip] = 0;
//   global._ipRequestCounts[req.ip]++;

//   // If threats were detected, log them with high priority
//   if (threats.length > 0) {
//     requestData.threats = threats;
//     logger.warn("SECURITY THREAT DETECTED", requestData);

//     // For serious threats, you might want to block the request
//     if (
//       threats.includes("SQL_INJECTION") ||
//       threats.includes("PATH_TRAVERSAL")
//     ) {
//       return res.status(403).json({
//         status: "error",
//         message: "Request blocked for security reasons",
//       });
//     }
//   }
//   // Otherwise log regular access at a lower level
//   else if (
//     req.path.includes("/api/v1/admin") ||
//     req.path.includes("/api/v1/doctors")
//   ) {
//     // Log sensitive endpoints at info level
//   } else {
//     // Log normal traffic at debug level to avoid log bloat
//     logger.debug("API_REQUEST", requestData);
//   }

//   // Track response for further logging
//   const originalEnd = res.end;
//   res.end = function (chunk, encoding) {
//     res.end = originalEnd;
//     res.end(chunk, encoding);

//     const responseData = {
//       requestId: requestData.requestId,
//       statusCode: res.statusCode,
//       responseTime: Date.now() - new Date(requestData.timestamp).getTime(),
//       contentLength: res.getHeader("content-length") || 0,
//     };

//     // Log failed responses (400+)
//     if (res.statusCode >= 400) {
//       logger.warn("API_ERROR_RESPONSE", {
//         ...responseData,
//         ip: requestData.ip,
//         path: requestData.path,
//         method: requestData.method,
//       });
//     }
//   };

//   return next();
// };

// module.exports = securityLogger;
