const router = require("express").Router();
const Response = require("../../../utils/response.utils");

router.get("/", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:id", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    console.log("Welcome Home");
  } catch (error) {
    console.error(error);
    next(error);
  }
});
