const router = require("express").Router();
const { param } = require("express-validator");
const {
  CreateCityValidation,
  UpdateCityValidation,
  CityIDValidation,
} = require("../../../validations/cities.validations");
const { Validate } = require("../../../validations/validate");
const {
  GetCitiesController,
  GetCityByIDController,
  CreateCityController,
  UpdateCityByIdController,
  UpdateCityStatusController,
  DeleteCityByIdController,
} = require("../../../controllers/admin/cities.controller");

router.get("/", GetCitiesController);
router.get("/:id", CityIDValidation, Validate, GetCityByIDController);
router.post("/", CreateCityValidation, Validate, CreateCityController);
router.put("/:id", UpdateCityValidation, Validate, UpdateCityByIdController);
router.patch("/:id/", CityIDValidation, Validate, UpdateCityStatusController);
router.delete("/:id", CityIDValidation, Validate, DeleteCityByIdController);

module.exports = router;
