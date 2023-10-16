const router = require("express").Router();
const {
  GetBlogCategoriesController,
  GetBlogCategoryByIDController,
  CreateBlogCategoryController,
  UpdateBlogCategoryByIdController,
  UpdateBlogCategoryStatusController,
  DeleteBlogCategoryByIdController,
} = require("../../../controllers/admin/blog-categories.controller");

router.get("/", GetBlogCategoriesController);
router.post("/:id", GetBlogCategoryByIDController);
router.post("/", CreateBlogCategoryController);
router.put("/:id", UpdateBlogCategoryByIdController);
router.patch(":/id/:status", UpdateBlogCategoryStatusController);
router.delete("/:id", DeleteBlogCategoryByIdController);
