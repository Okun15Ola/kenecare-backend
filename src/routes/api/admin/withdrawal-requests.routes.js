const router = require("express").Router();
const {
  GetAllWithdrawalRequestsController,
  GetWithdrawalRequestByIdController,
  ApproveWithdrawalRequestController,
  DenyWithdrawalRequestController,
} = require("../../../controllers/admin/withdrawals.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");
const { Validate } = require("../../../validations/validate");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("withdrawal_requests"),
  GetAllWithdrawalRequestsController,
);
router.get("/:id", GetWithdrawalRequestByIdController);
router.put("/approve/:id", ApproveWithdrawalRequestController);
router.put("/deny/:id", DenyWithdrawalRequestController);

module.exports = router;
