const router = require("express").Router();
const {
  GetBlogsController,
  GetBlogByIDController,
  CreateBlogController,
  UpdateBlogByIdController,
  UpdateBlogStatusController,
  DeleteBlogByIdController,
} = require("../../../controllers/admin/blogs.controller");

router.get("/", GetBlogsController);
router.get("/:id", GetBlogByIDController);
router.post("/", CreateBlogController);
router.put("/:id", UpdateBlogByIdController);
router.patch("/:id/", UpdateBlogStatusController);
router.delete("/:id", DeleteBlogByIdController);

module.exports = router