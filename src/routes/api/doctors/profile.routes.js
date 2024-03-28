const router = require("express").Router();
const { body, param } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetDoctorProfileController,
  CreateDoctorProfileController,
  UpdateDoctorProfileByIdController,
  UpdateDoctorProfilePictureController,
  GetDoctorCouncilRegistrationController,
  CreateDoctorCouncilRegistration,
} = require("../../../controllers/doctors/profile.controller");
const { getCityById } = require("../../../db/db.cities");
const { getSpecializationById } = require("../../../db/db.specializations");
const { getDoctorById } = require("../../../db/db.doctors");
const { USERTYPE } = require("../../../utils/enum.utils");
const {
  localProfilePicUploader,
  localMediaUploader,
} = require("../../../utils/file-upload.utils");
const { getMedicalCouncilById } = require("../../../db/db.medical-councils");
const { getSpecialtiyById } = require("../../../db/db.specialities");

router.get("/profile", GetDoctorProfileController);
router.post(
  "/profile",
  [
    body("title").notEmpty().withMessage("Title is required").trim().escape(),
    body("firstname")
      .notEmpty()
      .withMessage("First Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("First Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("middlename").trim().escape(),
    body("lastname")
      .notEmpty()
      .withMessage("Last Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Last Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .trim()
      .escape()
      .toLowerCase(),
    body("specialization")
      .notEmpty()
      .withMessage("Specialization is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("Invalid Specialization")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getSpecialtiyById(id);
        if (!data) {
          throw new Error("Specified Specialization Does not exist");
        }
      }),
    body("qualifications")
      .notEmpty()
      .withMessage("Qualifications is required")
      .trim()
      .escape(),
    body("city")
      .notEmpty()
      .withMessage("City is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("Invalid City")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getCityById(id);
        if (!data) {
          throw new Error("Specified City Does not exist");
        }
      }),
    body("yearOfExperience")
      .notEmpty()
      .withMessage("Year(s) of Experience is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0, lt: 100 })
      .withMessage("Year(s) of experience must be a positive integer")
      .trim()
      .escape(),
  ],
  Validate,
  CreateDoctorProfileController
);
router.put(
  "/profile/",
  [
    // param("id")
    //   .notEmpty()
    //   .withMessage("Doctor ID is required")
    //   .isNumeric({ no_symbols: true })
    //   .isInt({ allow_leading_zeroes: false, gt: 0 })
    //   .withMessage("Doctor ID must be a positive integer")
    //   .trim()
    //   .escape()
    //   .custom(async (id, { req }) => {
    //     const data = await getDoctorById(id);

    //     if (!data) {
    //       throw new Error("Doctor Profile Not Found");
    //     }
    //     const { is_profile_approved } = data;
    //     // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
    //     //   throw new Error(
    //     //     "Requested Doctor Profile has not been approved. Please contact admin for further information"
    //     //   );
    //     // }
    //     return true;
    //   }),
    body("title").notEmpty().withMessage("Title is required").trim().escape(),
    body("firstname")
      .notEmpty()
      .withMessage("First Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("First Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("middlename").trim().escape(),
    body("lastname")
      .notEmpty()
      .withMessage("Last Name is required")
      .isLength({ min: 1, max: 50 })
      .withMessage("Last Name Must not be longer than 50 character")
      .trim()
      .escape(),
    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .trim()
      .escape()
      .toLowerCase(),
    body("specialization")
      .notEmpty()
      .withMessage("Specialization is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("City must be a positive integer")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getSpecializationById(id);
        if (!data) {
          throw new Error("Specified Specialization Does not exist");
        }
        return true;
      }),
    body("qualifications")
      .notEmpty()
      .withMessage("Qualifications is required")
      .trim()
      .escape(),
    body("city")
      .notEmpty()
      .withMessage("City is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0 })
      .withMessage("City must be a positive integer")
      .trim()
      .escape()
      .custom(async (id, { req }) => {
        const data = await getCityById(id);
        if (!data) {
          throw new Error("Specified City Does not exist");
        }
        return true;
      }),
    body("yearOfExperience")
      .notEmpty()
      .withMessage("Year(s) of Experience is required")
      .isNumeric({ no_symbols: true })
      .isInt({ allow_leading_zeroes: false, gt: 0, lt: 100 })
      .withMessage("Year(s) of experience must be a positive integer")
      .trim()
      .escape(),
  ],
  Validate,
  UpdateDoctorProfileByIdController
);
router.patch(
  "/profile/",
  localProfilePicUploader.single("profilepic"),
  // [
  //   param("id")
  //     .notEmpty()
  //     .withMessage("Doctor ID is required")
  //     .isNumeric({ no_symbols: true })
  //     .isInt({ allow_leading_zeroes: false, gt: 0 })
  //     .withMessage("Doctor ID must be a positive integer")
  //     .trim()
  //     .escape()
  //     .custom(async (id, { req }) => {
  //       const data = await getDoctorById(id);

  //       if (!data) {
  //         throw new Error("Doctor Profile Not Found");
  //       }
  //       const { is_profile_approved, user_id, user_type } = data;
  //       if (req.user.id !== user_id || user_type !== USERTYPE.DOCTOR) {
  //         throw new Error("Unauthorized Accoun Access");
  //       }
  //       // if (is_profile_approved !== VERIFICATIONSTATUS.VERIFIED) {
  //       //   throw new Error(
  //       //     "Requested Doctor Profile has not been approved. Please contact admin for further information"
  //       //   );
  //       // }
  //       return true;
  //     }),
  // ],
  // Validate,
  UpdateDoctorProfilePictureController
);

// router.post(
//   "/council-registration",
//   localMediaUploader.single("regCertificate"),
//   [
//     body("councilId")
//       .notEmpty()
//       .withMessage("Please specify medical council ID")
//       .trim()
//       .escape()
//       .custom(async (id, { req }) => {
//         const data = await getMedicalCouncilById(id);
//         if (!data) {
//           throw new Error("Medical Council Not Found.");
//         }
//         return true;
//       }),
//     body("regNumber")
//       .notEmpty()
//       .withMessage("Registration Number is requred")
//       .trim()
//       .escape()
//       .toUpperCase(),
//     body("certIssuedDate")
//       .notEmpty()
//       .withMessage("Please specify medical council ID")
//       .trim()
//       .escape(),
//     body("certExpiryDate")
//       .notEmpty()
//       .withMessage("Please specify medical council ID")
//       .trim()
//       .escape(),
//   ],
//   Validate,
//   CreateDoctorCouncilRegistration
// );
// router.get("/council-registration", GetDoctorCouncilRegistrationController);
module.exports = router;
