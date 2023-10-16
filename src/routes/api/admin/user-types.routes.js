const router = require("express").Router();
const {
  GetUserTypesController,
  GetUserTypeByIDController,
  CreateUserTypeController,
  UpdateUserTypeByIdController,
  UpdateUserTypeStatusController,
  DeleteUserTypeByIdController,
} = require("../../../controllers/admin/user-types.controller");

router.get("/", GetUserTypesController);
router.post("/:id", GetUserTypeByIDController);
router.post("/", CreateUserTypeController);
router.put("/:id", UpdateUserTypeByIdController);
router.patch("/:id/:status", UpdateUserTypeStatusController);
router.delete("/:id", DeleteUserTypeByIdController);
