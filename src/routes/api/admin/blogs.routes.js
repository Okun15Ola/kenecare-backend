const router = require("express").Router();
const {
  GetBlogsController,
  GetBlogByIDController,
  CreateBlogController,
  UpdateBlogByIdController,
  UpdateBlogStatusController,
  DeleteBlogByIdController,
} = require("../../../controllers/admin/blogs.controller");
const { AWSUploader } = require("../../../utils/file-upload.utils");
router.get("/", GetBlogsController);
router.get("/:id", GetBlogByIDController);
router.post("/", AWSUploader.single("image"), CreateBlogController);
router.put("/:id", AWSUploader.single("image"), UpdateBlogByIdController);
router.patch("/:id/", UpdateBlogStatusController);
router.delete("/:id", DeleteBlogByIdController);

module.exports = router;
