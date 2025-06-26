const router = require("express").Router();
const {
  GetBlogCategoriesController,
  GetBlogCategoryByIDController,
  CreateBlogCategoryController,
  UpdateBlogCategoryByIdController,
  UpdateBlogCategoryStatusController,
  DeleteBlogCategoryByIdController,
} = require("../../../controllers/admin/blog-categories.controller");
const { Validate } = require("../../../validations/validate");
const {
  blogCategoryValidations,
} = require("../../../validations/admin/blog-category.validations");

router.get("/", GetBlogCategoriesController);
router.get("/:id", GetBlogCategoryByIDController);
router.post(
  "/",
  blogCategoryValidations,
  Validate,
  CreateBlogCategoryController,
);
router.put(
  "/:id",
  blogCategoryValidations,
  Validate,
  UpdateBlogCategoryByIdController,
);
router.patch("/:id/", UpdateBlogCategoryStatusController);
router.delete("/:id", DeleteBlogCategoryByIdController);

module.exports = router;
