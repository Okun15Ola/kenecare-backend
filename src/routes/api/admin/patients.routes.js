const router = require("express").Router();
const {
  GetPatientsController,
  GetPatientByIdController,
  GetPatientTestimonialsController,
} = require("../../../controllers/admin/patients.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const { Validate } = require("../../../validations/validate");
const logger = require("../../../middlewares/logger.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", paginationValidation, Validate, GetPatientsController);

router.get("/:id", GetPatientByIdController);
router.get("/testimonials", GetPatientTestimonialsController);

router.put("/:id", (req, res, next) => {
  try {
    logger.info("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    logger.info("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
