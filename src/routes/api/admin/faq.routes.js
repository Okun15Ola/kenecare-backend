const router = require("express").Router();

const {
  GetFaqsController,
  GetFaqByIdController,
  CreateFaqController,
  UpdateFaqByIdController,
  UpdateFaqStatusController,
  DeleteFaqByIdController,
} = require("../../../controllers/admin/faqs.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetFaqsController);
router.post("/:id", GetFaqByIdController);
router.post("/", CreateFaqController);
router.put("/:id", UpdateFaqByIdController);
router.patch("/:id/:status", UpdateFaqStatusController);
router.delete("/:id", DeleteFaqByIdController);

module.exports = router;
