const router = require("express").Router();

const { Validate } = require("../../../validations/validate");
const {
  CreateFollowUpValidation,
} = require("../../../validations/followups.validations");
const {
  CreateAppointmentFollowUpController,
} = require("../../../controllers/doctors/followups.controller");

// router.get("/", (req, res, next) => {
//   console.log("Get all follow ups");
//   return res.end();
// });
router.post(
  "/",
  CreateFollowUpValidation,
  Validate,
  CreateAppointmentFollowUpController,
);
// router.get("/:id", (req, res, next) => {
//   console.log("Get follow up by ID");
//   return res.end();
// });
// router.get("/appointment/:id", (req, res, next) => {
//   console.log("Get appointment follow up by appointment Id");
//   return res.end();
// });

module.exports = router;
