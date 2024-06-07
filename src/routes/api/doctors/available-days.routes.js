const router = require("express").Router();
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
} = require("../../../controllers/doctors/wallet.controller");
const { limiter: rateLimit } = require("../../../utils/rate-limit.utils");

rateLimit(router);
router.get("/", GetDoctorWalletController);
router.post("/", (req, res, next) => {
  try {
    const { days } = req.body;
    days.forEach((day) => {
      console.log(day);
    });
    return res.end();
  } catch (error) {
    console.log(error);
    return next(error);
  }
});
router.patch("/", UpdateWalletPinController);

module.exports = router;
