const router = require("express").Router();
const { Validate } = require("../../../validations/validate");
const doctorBlogValidation = require("../../../validations/doctors/doctor-blogs.validations");
const doctorBlogController = require("../../../controllers/doctors/doctor.health-blogs.controller");
const { limiter } = require("../../../utils/rate-limit.utils");
const { AWSUploader } = require("../../../utils/file-upload.utils");
const {
  authenticateUser,
  authorizeDoctor,
} = require("../../../middlewares/auth.middleware");

router.use(authenticateUser, limiter, authorizeDoctor);

router.get("/", Validate, doctorBlogController.GetDoctorBlogsController);

router.get(
  "/published",
  Validate,
  doctorBlogController.GetDoctorPublishedBlogsController,
);

router.get(
  "/:blogUuid",
  doctorBlogValidation.blogUuidValidation,
  Validate,
  doctorBlogController.GetDoctorBlogController,
);

router.post(
  "/",
  AWSUploader.single("image"),
  doctorBlogValidation.blogValidation,
  Validate,
  doctorBlogController.CreateDoctorBlogController,
);

router.put(
  "/:blogUuid",
  AWSUploader.single("image"),
  [
    ...doctorBlogValidation.blogUuidValidation,
    ...doctorBlogValidation.blogValidation,
  ],
  Validate,
  doctorBlogController.UpdateDoctorBlogController,
);

router.patch(
  "/status/:blogUuid",
  [
    ...doctorBlogValidation.blogUuidValidation,
    ...doctorBlogValidation.updateBlogStatusValidation,
  ],
  Validate,
  doctorBlogController.UpdateDoctorBlogStatusController,
);

router.delete(
  "/:blogUuid",
  doctorBlogValidation.blogUuidValidation,
  Validate,
  doctorBlogController.DeleteDoctorBlogController,
);

module.exports = router;
