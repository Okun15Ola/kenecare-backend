const router = require("express").Router();
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
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");
const {
  paginationValidation,
} = require("../../../validations/pagination.validations");
const {
  calculatePaginationInfo,
} = require("../../../middlewares/paginator.middleware");

router.use(authenticateAdmin, adminLimiter); // Rate limiting middleware applied to all routes in this router

router.get(
  "/",
  paginationValidation,
  Validate,
  calculatePaginationInfo("cities"),
  GetCitiesController,
);
router.get("/:id", CityIDValidation, Validate, GetCityByIDController);
router.post("/", CreateCityValidation, Validate, CreateCityController);
router.put("/:id", UpdateCityValidation, Validate, UpdateCityByIdController);
router.patch("/:id/", CityIDValidation, Validate, UpdateCityStatusController);
router.delete("/:id", CityIDValidation, Validate, DeleteCityByIdController);

module.exports = router;
