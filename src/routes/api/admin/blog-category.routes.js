const router = require("express").Router();
const { body } = require("express-validator");
const {
  GetBlogCategoriesController,
  GetBlogCategoryByIDController,
  CreateBlogCategoryController,
  UpdateBlogCategoryByIdController,
  UpdateBlogCategoryStatusController,
  DeleteBlogCategoryByIdController,
} = require("../../../controllers/admin/blog-categories.controller");
const { Validate } = require("../../../validations/validate");

router.get("/", GetBlogCategoriesController);
router.get("/:id", GetBlogCategoryByIDController);
router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .withMessage("Blog Category Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 150, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
  ],
  Validate,
  CreateBlogCategoryController,
);
router.put(
  "/:id",
  [
    body("name")
      .notEmpty()
      .withMessage("Blog Category Name is required")
      .toLowerCase()
      .trim()
      .isLength({ max: 150, min: 3 })
      .withMessage("Must be more than 3 characters long")
      .escape(),
  ],
  Validate,
  UpdateBlogCategoryByIdController,
);
router.patch("/:id/", UpdateBlogCategoryStatusController);
router.delete("/:id", DeleteBlogCategoryByIdController);

module.exports = router;
