const router = require("express").Router();
const {
  GetCitiesController,
  GetCityByIDController,
  CreateCityController,
  UpdateCityByIdController,
  DeleteCityByIdController,
} = require("../../../controllers/admin/cities.controller");

router.get("/", GetCitiesController);
router.post("/:id", GetCityByIDController);
router.post("/", CreateCityController);
router.put("/:id", UpdateCityByIdController);
router.delete("/:id", DeleteCityByIdController);

module.exports = router;