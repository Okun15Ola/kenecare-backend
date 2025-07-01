const router = require("express").Router();
const {
  GetMedicalCouncilsController,
  GetMedicalCouncilByIDController,
  CreateMedicalCouncilController,
  UpdateMedicalCouncilByIdController,
  UpdateMedicalCouncilStatusController,
  DeleteMedicalCouncilByIdController,
} = require("../../../controllers/admin/medical-council.controller");

const {
  CreateMedicalCouncilValidation,
  UpdateMedicalCouncilValidation,
  MedicalCouncilIDValidation,
} = require("../../../validations/medical-council.validations");
const { Validate } = require("../../../validations/validate");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetMedicalCouncilsController);
router.get("/:id", GetMedicalCouncilByIDController);
router.post(
  "/",
  CreateMedicalCouncilValidation,
  Validate,
  CreateMedicalCouncilController,
);
router.put(
  "/:id",
  UpdateMedicalCouncilValidation,
  Validate,
  UpdateMedicalCouncilByIdController,
);
router.patch(
  "/:id/",
  MedicalCouncilIDValidation,
  Validate,
  UpdateMedicalCouncilStatusController,
);
router.delete(
  "/:id",
  MedicalCouncilIDValidation,
  Validate,
  DeleteMedicalCouncilByIdController,
);

module.exports = router;
