const router = require("express").Router();
const {
  GetDoctorsController,
  GetDoctorByIDController,
  UpdateDoctorByIdController,
  UpdateDoctorStatusController,
  DeleteDoctorByIdController,
} = require("../../../controllers/admin/doctors.controller");

router.get("/", GetDoctorsController);
router.post("/:id", GetDoctorByIDController);
router.put("/:id", UpdateDoctorByIdController);
router.patch("/:id/:status", UpdateDoctorStatusController);
router.delete("/:id", DeleteDoctorByIdController);

module.exports = router;
