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
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetBlogsController);
router.get("/:id", GetBlogByIDController);
router.post("/", AWSUploader.single("image"), CreateBlogController);
router.put("/:id", AWSUploader.single("image"), UpdateBlogByIdController);
router.patch("/:id/", UpdateBlogStatusController);
router.delete("/:id", DeleteBlogByIdController);

module.exports = router;
