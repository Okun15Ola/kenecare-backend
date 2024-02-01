const router = require("express").Router();
const {
  GetDoctorsController,
  GetDoctorByIDController,
  UpdateDoctorByIdController,
  UpdateDoctorStatusController,
  DeleteDoctorByIdController,
  GetDoctorsCouncilRegistrationController,
} = require("../../../controllers/admin/doctors.controller");

router.get("/", GetDoctorsController);
router.get("/council-registration", GetDoctorsCouncilRegistrationController);
router.post("/:id", GetDoctorByIDController);
router.put("/:id", UpdateDoctorByIdController);
router.patch("/:id/:status", UpdateDoctorStatusController);
router.delete("/:id", DeleteDoctorByIdController);

module.exports = router;
