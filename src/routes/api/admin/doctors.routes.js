const router = require("express").Router();
const {
  GetDoctorsController,
  GetDoctorByIDController,
  UpdateDoctorByIdController,
  ApproveDoctorAccountController,
  DeleteDoctorByIdController,
} = require("../../../controllers/admin/doctors.controller");
const {
  GetCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.council-registration.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");
const { Validate } = require("../../../validations/validate");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("doctors"),
  GetDoctorsController,
);
router.get("/:id", GetDoctorByIDController);
router.get(
  "/council-registration",
  paginationValidation,
  Validate,
  calculatePaginationInfo("doctors_council_registration"),
  GetCouncilRegistrationController,
);
router.post("/:id", GetDoctorByIDController);
router.put("/:id", UpdateDoctorByIdController);
router.patch("/:id/approve", ApproveDoctorAccountController);
router.delete("/:id", DeleteDoctorByIdController);

module.exports = router;
