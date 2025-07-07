const router = require("express").Router();
const {
  GetDoctorWalletController,
  UpdateWalletPinController,
} = require("../../../controllers/doctors/wallet.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor); // Authentication middleware & Rate limiting middleware applied to all routes in this router

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
