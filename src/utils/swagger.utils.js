const express = require("express");
const swaggerJSDocs = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../../package.json");
const logger = require("../middlewares/logger.middleware");
const Response = require("./response.utils");

const options = swaggerJSDocs({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rest API Docs",
      version,
    },
    components: {
      securitySchemas: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});
