const router = require("express").Router();
const faqController = require("../../../controllers/admin/faqs.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const validation = require("../../../validations/admin/faq.validations");
const { Validate } = require("../../../validations/validate");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");

router.use(authenticateAdmin, adminLimiter);

router.get(
  "/",
  paginationValidation,
  Validate,
  faqController.GetFaqsController,
);
router.post(
  "/",
  validation.faqValidation,
  Validate,
  faqController.CreateFaqController,
);
router.put(
  "/:id",
  [...validation.faqIdParamValidation, ...validation.faqValidation],
  Validate,
  faqController.UpdateFaqByIdController,
);
router.patch(
  "/:id/publish",
  validation.faqIdParamValidation,
  Validate,
  faqController.PublishFaqController,
);
router.patch(
  "/:id/unpublish",
  validation.faqIdParamValidation,
  Validate,
  faqController.UnPublishFaqController,
);
router.delete(
  "/:id",
  validation.faqIdParamValidation,
  Validate,
  faqController.DeleteFaqByIdController,
);

module.exports = router;
