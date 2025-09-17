const router = require("express").Router();
const {
  GetUserTypesController,
  GetUserTypeByIDController,
  CreateUserTypeController,
  UpdateUserTypeByIdController,
  UpdateUserTypeStatusController,
  DeleteUserTypeByIdController,
} = require("../../../controllers/admin/user-types.controller");
const { adminLimiter } = require("../../../utils/rate-limit.utils");
const { authenticateAdmin } = require("../../../middlewares/auth.middleware");

router.use(authenticateAdmin, adminLimiter); // Authentication middleware & Rate limiting middleware applied to all routes in this router

router.get("/", GetUserTypesController);
router.post("/:id", GetUserTypeByIDController);
router.post("/", CreateUserTypeController);
router.put("/:id", UpdateUserTypeByIdController);
router.patch("/:id/:status", UpdateUserTypeStatusController);
router.delete("/:id", DeleteUserTypeByIdController);
