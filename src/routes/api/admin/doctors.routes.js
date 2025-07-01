const router = require("express").Router();
const {
  GetDoctorsController,
  GetDoctorByIDController,
  UpdateDoctorByIdController,
  ApproveDoctorAccountController,
  DeleteDoctorByIdController,
  GetDoctorsCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetDoctorsController);
router.get("/:id", GetDoctorByIDController);
router.get("/council-registration", GetDoctorsCouncilRegistrationController);
router.post("/:id", GetDoctorByIDController);
router.put("/:id", UpdateDoctorByIdController);
router.patch("/:id/approve", ApproveDoctorAccountController);
router.delete("/:id", DeleteDoctorByIdController);

module.exports = router;
