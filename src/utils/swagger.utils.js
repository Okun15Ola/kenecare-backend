const swaggerJSDocs = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../../package.json");
const { OpenApiValidator } = require("express-openapi-validator");

const swaggerDocs = swaggerJSDocs({
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kenecare API Docs",
      description: "API Documentation for Kenecare",
      version,
      contact: {
        name: "Chinedum Roland Eke",
        email: "chinedum.eke@imo-tech.com",
        url: "https://imo-tech.com/support",
      },
      license: "MIT",
    },
    basePath: "/api/v1",
    tags: [
      "Auth",
      "Admins",
      "Doctors",
      "Patients",
      "Blogs",
      "Blog Categories",
      "Common Symptoms",
      "Cities",
      "Services",
      "Specializations",
      "Specialties",
      "Testimonials",
    ],
    host: "api.kenecare.com",
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
  apis: [`${__dirname}/../routes/api/*.js`],
});

// console.log(swaggerDocs);
module.exports = swaggerDocs;
