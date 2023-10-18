const router = require("express").Router();
const { body } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetSpecializationsController,
  GetSpecializationByIDController,
  CreateSpecializationController,
  UpdateSpecializationByIdController,
  UpdateSpecializationStatusController,
  DeleteSpecializationByIdController,
} = require("../../../controllers/admin/specializations.controller");

router.get("/", GetSpecializationsController);
router.get("/:id", GetSpecializationByIDController);
router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .withMessage("Specialization Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 150, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
    body("description")
      .notEmpty()
      .withMessage("Specialization Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 250, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
  ],
  Validate,
  CreateSpecializationController
);
router.put("/:id", UpdateSpecializationByIdController);
router.patch(
  "/:id/",
  [
    body("name")
      .notEmpty()
      .withMessage("Specialization Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 150, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
    body("description")
      .notEmpty()
      .withMessage("Specialization Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 250, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
  ],
  Validate,
  UpdateSpecializationStatusController
);
router.delete("/:id", DeleteSpecializationByIdController);

module.exports = router;
