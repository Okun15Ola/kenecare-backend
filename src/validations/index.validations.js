const { param } = require("express-validator");
const { getDoctorById } = require("../repository/doctors.repository");

exports.doctorIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("Specify Doctor Id")
    .escape()
    .trim()
    .custom(async (value) => {
      const id = parseInt(value, 10);

      const isValidNumber = Number.isSafeInteger(id);
      if (!isValidNumber) {
        throw new Error("Please provide a valid ID");
      }
      const doctorId = Number(id);
      const data = await getDoctorById(doctorId);
      if (!data) {
        throw new Error("Doctor Not Found");
      }
      return true;
    }),
];
