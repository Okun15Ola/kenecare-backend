const router = require("express").Router();
const {
  GetDoctorsController,
  GetDoctorByIDController,
  UpdateDoctorByIdController,
  ApproveDoctorAccountController,
  DeleteDoctorByIdController,
  GetDoctorsCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.controller");

router.get("/", GetDoctorsController);
router.get("/council-registration", GetDoctorsCouncilRegistrationController);
router.post("/:id", GetDoctorByIDController);
router.put("/:id", UpdateDoctorByIdController);
router.patch("/:id/approve", ApproveDoctorAccountController);
router.delete("/:id", DeleteDoctorByIdController);

module.exports = router;
