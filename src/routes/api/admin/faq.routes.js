const router = require("express").Router();

const {
  GetFaqsController,
  GetFaqByIdController,
  CreateFaqController,
  UpdateFaqByIdController,
  UpdateFaqStatusController,
  DeleteFaqByIdController,
} = require("../../../controllers/admin/faqs.controller");

router.get("/", GetFaqsController);
router.post("/:id", GetFaqByIdController);
router.post("/", CreateFaqController);
router.put("/:id", UpdateFaqByIdController);
router.patch("/:id/:status", UpdateFaqStatusController);
router.delete("/:id", DeleteFaqByIdController);

module.exports = router;
