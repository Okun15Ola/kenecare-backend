const router = require("express").Router();
const {
  GetPatientsController,
  GetPatientByIdController,
  GetPatientTestimonialsController,
} = require("../../../controllers/admin/patients.controller");

router.get("/", GetPatientsController);

router.get("/:id", GetPatientByIdController);
router.get("/testimonials", GetPatientTestimonialsController);

router.put("/:id", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
