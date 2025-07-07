const router = require("express").Router();
const {
  GetCouncilRegistrationController,
  GetCouncilRegistrationByIdController,
  ApproveCouncilRegistrationController,
  RejectCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.council-registration.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetCouncilRegistrationController);
router.get("/:id", GetCouncilRegistrationByIdController);
router.patch("/:id/approve", ApproveCouncilRegistrationController);
router.patch("/:id/reject", RejectCouncilRegistrationController);

module.exports = router;
