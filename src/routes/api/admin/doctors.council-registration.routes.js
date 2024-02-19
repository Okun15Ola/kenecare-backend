const router = require("express").Router();
const {
  GetCouncilRegistrationController,
  GetCouncilRegistrationByIdController,
  ApproveCouncilRegistrationController,
  RejectCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.council-registration.controller");

router.get("/", GetCouncilRegistrationController);
router.get("/:id", GetCouncilRegistrationByIdController);
router.patch("/:id/approve", ApproveCouncilRegistrationController);
router.patch("/:id/reject", RejectCouncilRegistrationController);

module.exports = router;
