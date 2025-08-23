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

router.use(authenticateUser, limiter);

router.get(
  "/",
  authorizeDoctor,
  Validate,
  doctorBlogController.GetDoctorBlogsController,
);

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
  authorizeDoctor,
  AWSUploader.single("image"),
  doctorBlogValidation.blogValidation,
  Validate,
  doctorBlogController.CreateDoctorBlogController,
);

router.put(
  "/:blogUuid",
  authorizeDoctor,
  AWSUploader.single("image"),
  [
    ...doctorBlogValidation.blogUuidValidation,
    ...doctorBlogValidation.blogValidation,
  ],
  Validate,
  doctorBlogController.UpdateDoctorBlogController,
);

router.patch(
  "/status/:blogUuid/publish",
  authorizeDoctor,
  doctorBlogValidation.blogUuidValidation,
  Validate,
  doctorBlogController.PublishDoctorBlogStatusController,
);

router.patch(
  "/status/:blogUuid/archive",
  authorizeDoctor,
  doctorBlogValidation.blogUuidValidation,
  Validate,
  doctorBlogController.ArchivedDoctorBlogStatusController,
);

router.delete(
  "/:blogUuid",
  authorizeDoctor,
  doctorBlogValidation.blogUuidValidation,
  Validate,
  doctorBlogController.DeleteDoctorBlogController,
);

module.exports = router;
