const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const doctorFaqValidation = require("../../../validations/doctors/doctor-faqs.validations");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const doctorFaqController = require("../../../controllers/doctors/faqs.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor);

router.get(
  "/",
  paginationValidation,
  Validate,
  doctorFaqController.GetDoctorFaqsController,
);

router.get(
  "/active",
  paginationValidation,
  Validate,
  doctorFaqController.GetDoctorActiveFaqsController,
);

router.get(
  "/:id",
  doctorFaqValidation.faqIdValidation,
  Validate,
  doctorFaqController.GetDoctorFaqController,
);

router.post(
  "/",
  doctorFaqValidation.faqContentValidation,
  Validate,
  doctorFaqController.CreateDoctorFaqController,
);

router.put(
  "/:id",
  [
    ...doctorFaqValidation.faqContentValidation,
    ...doctorFaqValidation.faqContentValidation,
  ],
  Validate,
  doctorFaqController.UpdateDoctorFaqController,
);

router.patch(
  "/status/:id",
  [
    ...doctorFaqValidation.faqIdValidation,
    ...doctorFaqValidation.updateDoctorFaqStatusValidation,
  ],
  Validate,
  doctorFaqController.UpdateDoctorFaqStatusController,
);

router.delete(
  "/:id",
  doctorFaqValidation.faqIdValidation,
  Validate,
  doctorFaqController.DeleteDoctorFaqController,
);

module.exports = router;
