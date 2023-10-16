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
router.post("/:id", GetBlogByIDController);
router.post("/", CreateBlogController);
router.put("/:id", UpdateBlogByIdController);
router.patch("/:id/:status", UpdateBlogStatusController);
router.delete("/:id", DeleteBlogByIdController);
