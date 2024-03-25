const router = require("express").Router();
const {
  GetAllWithdrawalRequestsController,
  GetWithdrawalRequestByIdController,
  ApproveWithdrawalRequestController,
  DenyWithdrawalRequestController,
} = require("../../../controllers/admin/withdrawals.controller");

router.get("/", GetAllWithdrawalRequestsController);
router.get("/:id", GetWithdrawalRequestByIdController);
router.put("/approve/:id", ApproveWithdrawalRequestController);
router.put("/deny/:id", DenyWithdrawalRequestController);

module.exports = router;
