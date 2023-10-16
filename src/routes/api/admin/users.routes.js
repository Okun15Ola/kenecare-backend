const router = require("express").Router();
const {} = require("../../../controllers/admin/users.controller");

router.get("/", GetTestimonialsController);
router.post("/:id", GetTestimonialByIDController);
router.post("/", CreateTestimonialController);
router.put("/:id", UpdateTestimonialByIdController);
router.patch("/:id/:status", UpdateTestimonialStatusController);
router.delete("/:id", DeleteTestimonialByIdController);
